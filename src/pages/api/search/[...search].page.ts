import type { ErrorResponse } from '@/libs/api';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { validateAndMockResponse as validateOrMockResponse } from './mocks-support';

export type MerchandisingEnvironment = {
  merchandisingApiBaseUrl: string;
};

const isErrorSchemaCompatible = (err: unknown): err is ErrorResponse => {
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

  if (req.body) {
    headers.set('Content-Type', 'application/json');
  }

  const url = new URL(
    req.url?.replace('/api', '') ?? '',
    process.env.MERCHANDISING_API_BASEURL
  );
  url.searchParams.delete('mocks');

  url.searchParams.set(
    'apikey',
    process.env.MERCHANDISING_API_APIGEE_KEY || ''
  );

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: req.body ? JSON.stringify(req.body) : undefined,
    cache: 'no-store',
  });

  let jsonBody = {};
  let jsonText = '';
  let status = response.status;
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

    const result = validateOrMockResponse(req, response.status, jsonBody);
    if ('error' in result) {
      return res.status(500).json({ message: result.error, status: '500' });
    }
    jsonBody = result.updatedJsonBody;
    status = result.updatedStatus;
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

  return res.status(status).json(req.method === 'DELETE' ? {} : jsonBody);
};

export default proxy;
