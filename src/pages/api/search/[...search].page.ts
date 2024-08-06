import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { validateAndMockResponse as validateOrMockResponse } from '../merchandising/mocks-support';

export type MerchandisingEnvironment = {
  merchandisingApiBaseUrl: string;
};

const proxy = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req });

  const headers = new Headers();

  if (token && typeof token.accessToken === 'string') {
    headers.set('Authorization', `Bearer ${token.accessToken}`);
  } else if (process.env.E2E_TEST_USER_TOKEN) {
    headers.set('Authorization', `Bearer ${process.env.E2E_TEST_USER_TOKEN}`);
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
  });

  let jsonBody = {};
  let jsonText = '';
  let status = response.status;
  try {
    jsonText = await response.text();
    jsonBody = JSON.parse(jsonText);

    const result = validateOrMockResponse(req, response.status, jsonBody);
    if ('error' in result) {
      return res.status(500).json({ error: result.error });
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
          ? 'Permission denied, please contact your administrator'
          : 'Failed to fetch',
      status: response.status,
    });
  }

  if (!response.ok) {
    console.error(
      'Error fetching from search beta',
      response.status,
      response.statusText
    );
  }

  return res.status(status).json(req.method === 'DELETE' ? {} : jsonBody);
};

export default proxy;
