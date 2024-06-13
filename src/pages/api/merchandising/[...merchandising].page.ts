import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { validateAndMockResponse as validateOrMockResponse } from './mocks-support';

export type MerchandisingEnvironment = {
  merchandisingApiBaseUrl: string;
};

const proxy = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req });

  const headers = new Headers();

  if (token && typeof token.accessToken === 'string') {
    headers.set('Authorization', `Bearer ${token.accessToken}`);
  }

  if (req.body) {
    headers.set('Content-Type', 'application/json');
  }

  const url = new URL(
    req.url?.replace('/api', '') ?? '',
    process.env.MERCHANDISING_API_BASEURL
  );

  url.searchParams.set(
    'apikey',
    process.env.MERCHANDISING_API_APIGEE_KEY || ''
  );

  console.log('FETCH', req.method, url);

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
      console.log('Error in result', result.error);
      return res.status(500).json({ error: result.error });
    }
    jsonBody = result.updatedJsonBody;
    status = result.updatedStatus;
  } catch (e) /* istanbul ignore next */ {
    console.error('ERROR: Error parsing JSON', e, jsonBody);
    console.error('status', response.status);
    return res.status(500).json({
      error: 'Error parsing JSON',
      jsonText,
      apiResponseStatus: response.status,
    });
  }

  if (!response.ok) {
    console.error(
      'Error fetching from merchandising',
      response.status,
      response.statusText
    );
  }

  return res.status(status).json(req.method === 'DELETE' ? {} : jsonBody);
};

export default proxy;
