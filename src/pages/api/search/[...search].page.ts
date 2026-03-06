import type { MerchandisingErrorResponse } from '@/libs/api';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export type MerchandisingEnvironment = {
  merchandisingApiBaseUrl: string;
};

const isErrorSchemaCompatible = (
  err: unknown
): err is MerchandisingErrorResponse => {
  if (
    err &&
    typeof err === 'object' &&
    err &&
    'message' in err &&
    'status' in err &&
    typeof err.message === 'string' &&
    typeof err.status === 'string'
  ) {
    return true;
  }
  return false;
};

const proxy = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req });

  const headers = new Headers();

  if (token && typeof token.accessToken === 'string') {
    headers.set('Authorization', `Bearer ${token.accessToken}`);
  } else if (process.env.E2E_TEST_USER_TOKEN) {
    headers.set('Authorization', `Bearer ${process.env.E2E_TEST_USER_TOKEN}`);
  } else if (process.env.SMOKE_TEST_TOKEN) {
    headers.set('Authorization', `${process.env.SMOKE_TEST_TOKEN}`);
  }

  const isDelete = req.method === 'DELETE';
  const hasBody = !isDelete && req.body && Object.keys(req.body).length > 0;

  if (hasBody || isDelete) {
    headers.set('Content-Type', 'application/json');
  }

  const url = new URL(
    req.url?.replace('/api', '') ?? '',
    process.env.MERCHANDISING_API_BASEURL
  );
  url.searchParams.delete('mocks');

  url.searchParams.set(
    'apikey',
    process.env.MERCHANDISING_API_APIGEE_KEY ?? ''
  );

  // Apigee requires Content-Type + body even for DELETE - send empty JSON
  const response = await fetch(url, {
    method: req.method,
    headers,
    body: isDelete ? '{}' : hasBody ? JSON.stringify(req.body) : undefined,
    cache: 'no-store',
  });

  let jsonBody = {};
  let jsonText = '';
  try {
    jsonText = await response.text();
    jsonBody = jsonText ? JSON.parse(jsonText) : null;

    if (!response.ok) {
      console.error(
        'Error fetching from search beta',
        response.status,
        response.statusText
      );
    }

    if (response.status === 401) {
      return res.status(401).json({
        message: `${response.status} ${response.statusText}. Please login or try again`,
        status: `${response.status}`,
      });
    }

    if (response.status === 500) {
      if (isErrorSchemaCompatible(jsonBody)) {
        return res.status(500).json(jsonBody);
      }
      // 500 can come from ApiGee or other sources, so we need to translate it to our error schema
      return res.status(500).json({
        message: jsonText,
        status: `${response.status}`,
      });
    }
  } catch (e) /* istanbul ignore next */ {
    console.error('ERROR: Error parsing JSON', e, jsonBody);
    return res.status(response.status).json({
      error: 'Error parsing JSON',
      jsonText,
      apiResponseStatus: response.status,
      message:
        response.status === 401
          ? `Permission denied, please contact your administrator. ${jsonText}`
          : `Failed to fetch ${jsonText}`,
      status: response.status,
    });
  }

  return res
    .status(response.status)
    .json(req.method === 'DELETE' ? {} : jsonBody);
};

export default proxy;
