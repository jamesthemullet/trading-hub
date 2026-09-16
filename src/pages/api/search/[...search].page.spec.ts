import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';
import { createMockNextApiResponse } from '@/test/create-mock-next-api-response';

import { getToken } from 'next-auth/jwt';
import { pipeline } from 'node:stream/promises';

import type { MerchandisingEnvironment } from './[...search].page';
import proxy from './[...search].page';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock('node:stream/promises', () => ({
  pipeline: jest.fn().mockResolvedValue(undefined),
}));

const httpGet = jest.fn();
const httpPost = jest.fn();
const httpDelete = jest.fn();

const captureRequest =
  (fn: jest.Mock) =>
  async ({ request }: { request: Request }) => {
    const body = await request.text();
    return fn({
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: body.length > 0 ? JSON.parse(body) : null,
    });
  };

const baseUrl = 'https://merch';
const apiKey = 'someapikey';
const handlers = [
  http.delete('*', captureRequest(httpDelete)),
  http.get('*', captureRequest(httpGet)),
  http.post('*', captureRequest(httpPost)),
];

const server = setupServer(...handlers);

type Response = {
  status: number;
  body: object;
  envSettings?: Partial<MerchandisingEnvironment>;
};

const expectForwardedResponse = (
  res: ReturnType<typeof createMockNextApiResponse>,
  response: Response
): void => {
  const isStreamed =
    response.status >= 200 && response.status < 300 && response.status !== 204;
  expect(jest.mocked(res.setHeader).mock.calls).toEqual(
    isStreamed ? [['Content-Type', 'application/json']] : []
  );
  expect(jest.mocked(pipeline).mock.calls).toEqual(
    isStreamed ? [[expect.anything(), res]] : []
  );
  expect(jest.mocked(res.json).mock.calls).toEqual(
    isStreamed ? [] : [[response.body]]
  );
};

const expectSuccessfulResponseStreamed = (
  res: ReturnType<typeof createMockNextApiResponse>
): void => {
  expect(res.setHeader).toHaveBeenCalledWith(
    'Content-Type',
    'application/json'
  );
  expect(pipeline).toHaveBeenCalledWith(expect.anything(), res);
  expect(res.json).not.toHaveBeenCalled();
};

const responses: Response[][] = [
  [{ status: 200, body: { hello: 'world', products: [] } }],
  [{ status: 500, body: { message: 'error', status: '500' }, envSettings: {} }],
  [{ status: 500, body: { message: 'error', status: '500' } }],
  [{ status: 200, body: { rules: {} } }],
];

const performGet = async (
  url: string | undefined,
  response: Response,
  upstreamResponse = HttpResponse.json(response.body, {
    status: response.status,
  })
) => {
  const req = createMockNextApiRequest({
    url,
    method: 'GET',
  });

  const res = createMockNextApiResponse(req);
  httpGet.mockReturnValue(upstreamResponse);

  await proxy(req, res);
  return res;
};

const performDelete = async (url: string | undefined, response: Response) => {
  const req = createMockNextApiRequest({
    url,
    method: 'DELETE',
  });

  const res = createMockNextApiResponse(req);
  httpDelete.mockReturnValue(
    HttpResponse.json(response.body, { status: response.status })
  );

  await proxy(req, res);
  return res;
};

const performPost = async (
  url: string,
  response: (typeof responses)[0][0],
  requestBody: unknown
) => {
  const req = createMockNextApiRequest({
    url,
    method: 'POST',
    body: requestBody,
  });

  const res = createMockNextApiResponse(req);
  httpPost.mockReturnValue(
    HttpResponse.json(response.body, { status: response.status })
  );

  await proxy(req, res);
  return res;
};

const createClosedStreamError = (): Error & { code: string } =>
  Object.assign(new Error('Cannot pipe to a closed or destroyed stream'), {
    code: 'ERR_STREAM_UNABLE_TO_PIPE',
  });

describe('Search api proxy', () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    process.env.MERCHANDISING_API_BASEURL = baseUrl;
    process.env.MERCHANDISING_API_APIGEE_KEY = apiKey;
    process.env.AZURE_AD_CLIENT_ID = 'client_id';
    process.env.AZURE_AD_CLIENT_SECRET = 'client_secret';
    process.env.AZURE_AD_TENANT_ID = 'tenant_id';
    process.env.NEXTAUTH_SECRET = 'secret';
  });

  afterEach(() => {
    server.resetHandlers();
    jest.resetAllMocks();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_API_BASEURL;
  });

  describe('when logged in', () => {
    beforeEach(() => {
      jest.mocked(getToken).mockResolvedValueOnce({
        accessTokenExpires: 123,
        refreshToken: 'refreshToken',
        accessToken: 'token',
        user: {
          id: 'id',
          name: 'name',
          email: 'email',
        },
        roles: ['admin'],
      });
      jest.spyOn(console, 'error').mockImplementation(jest.fn());
      jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    });

    it.each(responses)(
      'forwards request to backend with Authorization for GET',
      async (response) => {
        const res = await performGet(
          '/api/search/beta/merchandising/facet',
          response
        );

        expect(httpGet).toHaveBeenCalled();
        expect(httpGet.mock.calls[0][0].url).toBe(
          `${baseUrl}/search/beta/merchandising/facet?apikey=${apiKey}`
        );
        expect(httpGet.mock.calls[0][0].method).toBe('GET');
        expect(httpGet.mock.calls[0][0].body).toBeNull();
        expect([...httpGet.mock.calls[0][0].headers]).toEqual([
          ['authorization', 'Bearer token'],
        ]);

        expect(res.status).toHaveBeenCalledWith(response.status);
        expectForwardedResponse(res, response);
      }
    );

    it.each(responses)(
      'forwards request to backend with Authorization for POST',
      async (response) => {
        const requestBody = { a: { request: 'body' } };
        const res = await performPost(
          '/search/beta/merchandising/facet/subcategory_429',
          response,
          requestBody
        );
        expect(httpPost).toHaveBeenCalled();
        expect(httpPost.mock.calls[0][0].url).toBe(
          `${baseUrl}/search/beta/merchandising/facet/subcategory_429?apikey=${apiKey}`
        );
        expect(httpPost.mock.calls[0][0].method).toBe('POST');
        expect(await httpPost.mock.calls[0][0].body).toStrictEqual(requestBody);
        expect([...httpPost.mock.calls[0][0].headers]).toEqual([
          ['authorization', 'Bearer token'],
          ['content-type', 'application/json'],
        ]);

        expect(res.status).toHaveBeenCalledWith(response.status);
        expectForwardedResponse(res, response);
      }
    );

    it.each(responses)(
      'forwards request to backend with Authorization for DELETE',
      async (response) => {
        const res = await performDelete(
          '/search/beta/merchandising/facet/1',
          response
        );

        expect(httpDelete).toHaveBeenCalled();
        expect(httpDelete.mock.calls[0][0].url).toBe(
          `${baseUrl}/search/beta/merchandising/facet/1?apikey=${apiKey}`
        );
        expect(httpDelete.mock.calls[0][0].method).toBe('DELETE');
        expect(httpDelete.mock.calls[0][0].body).toStrictEqual({});
        expect([...httpDelete.mock.calls[0][0].headers]).toEqual([
          ['authorization', 'Bearer token'],
          ['content-type', 'application/json'],
        ]);

        expect(res.status).toHaveBeenCalledWith(response.status);
      }
    );

    it('should return the correct body', async () => {
      const response = { status: 200 };
      const mockCall = async () => {
        const req = createMockNextApiRequest({
          url: '/search/beta/merchandising/facet/1',
          method: 'DELETE',
        });

        const res = createMockNextApiResponse(req);
        httpDelete.mockReturnValue(
          HttpResponse.json(undefined, { status: response.status })
        );

        await proxy(req, res);
        return res;
      };

      const res = await mockCall();

      expect(httpDelete).toHaveBeenCalled();
      expect(httpDelete.mock.calls[0][0].url).toBe(
        `${baseUrl}/search/beta/merchandising/facet/1?apikey=${apiKey}`
      );
      expect(httpDelete.mock.calls[0][0].method).toBe('DELETE');
      expect(httpDelete.mock.calls[0][0].body).toStrictEqual({});
      expect([...httpDelete.mock.calls[0][0].headers]).toEqual([
        ['authorization', 'Bearer token'],
        ['content-type', 'application/json'],
      ]);

      expect(res.status).toHaveBeenCalledWith(response.status);
      expect(res.json).toHaveBeenCalledWith({});
    });
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      jest.mocked(getToken).mockResolvedValueOnce(null);
    });

    it('when url is equal to /search/beta/merchandising/facet', async () => {
      const response = responses[0][0];
      const res = await performGet(
        '/search/beta/merchandising/facet?query=nonexisting',
        response
      );

      expect(httpGet).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expectSuccessfulResponseStreamed(res);
    });

    it('uses a JSON content type when the upstream response omits one', async () => {
      const response = responses[0][0];
      const res = await performGet(
        '/search/beta/merchandising/facet',
        response,
        new HttpResponse(JSON.stringify(response.body), {
          status: response.status,
          headers: { 'Content-Type': '' },
        })
      );

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json'
      );
      expect(pipeline).toHaveBeenCalledWith(expect.anything(), res);
    });

    it('preserves successful responses without a body', async () => {
      const res = await performGet(
        '/search/beta/merchandising/facet',
        { status: 204, body: {} },
        new HttpResponse(null, { status: 204 })
      );

      expect(pipeline).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith(null);
    });

    it('returns a 500 JSON error when streaming fails before headers are sent', async () => {
      const response = responses[0][0];
      const streamError = new Error('stream boom');
      jest.mocked(pipeline).mockRejectedValueOnce(streamError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const res = await performGet(
        '/search/beta/merchandising/facet',
        response
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error streaming response from merchandising API',
        streamError
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to stream response from merchandising API',
        status: '500',
      });
      expect(res.destroy).not.toHaveBeenCalled();
    });

    it('destroys the response when streaming fails after headers are sent', async () => {
      const response = responses[0][0];
      const streamError = new Error('stream boom');
      jest.mocked(pipeline).mockImplementationOnce(async (_source, dest) => {
        Object.defineProperty(dest, 'headersSent', {
          value: true,
          configurable: true,
        });
        throw streamError;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const res = await performGet(
        '/search/beta/merchandising/facet',
        response
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error streaming response from merchandising API',
        streamError
      );
      expect(res.destroy).toHaveBeenCalledWith(streamError);
      expect(res.json).not.toHaveBeenCalled();
    });

    it.each(['closed', 'destroyed', 'writableEnded'] as const)(
      'does not re-destroy a %s response after a streaming error',
      async (closedProperty) => {
        const response = responses[0][0];
        const streamError = new Error('stream boom');
        jest.mocked(pipeline).mockImplementationOnce(async (_source, dest) => {
          Object.defineProperties(dest, {
            [closedProperty]: { value: true, configurable: true },
            headersSent: { value: true, configurable: true },
          });
          throw streamError;
        });
        const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation();

        const res = await performGet(
          '/search/beta/merchandising/facet',
          response
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error streaming response from merchandising API',
          streamError
        );
        expect(res.destroy).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      }
    );

    it.each(['closed', 'destroyed', 'writableEnded'] as const)(
      'does not log or re-destroy when the response stream is already %s',
      async (closedProperty) => {
        const response = responses[0][0];
        const streamError = createClosedStreamError();
        jest.mocked(pipeline).mockImplementationOnce(async (_source, dest) => {
          Object.defineProperty(dest, closedProperty, {
            value: true,
            configurable: true,
          });
          throw streamError;
        });
        const consoleErrorSpy = jest
          .spyOn(console, 'error')
          .mockImplementation();

        const res = await performGet(
          '/search/beta/merchandising/facet',
          response
        );

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(res.destroy).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      }
    );

    it('handles an unable-to-pipe error when the response stream is open', async () => {
      const response = responses[0][0];
      const streamError = createClosedStreamError();
      jest.mocked(pipeline).mockRejectedValueOnce(streamError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const res = await performGet(
        '/search/beta/merchandising/facet',
        response
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error streaming response from merchandising API',
        streamError
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to stream response from merchandising API',
        status: '500',
      });
    });

    it('wraps a non-Error value thrown while streaming in an Error', async () => {
      const response = responses[0][0];
      jest.mocked(pipeline).mockRejectedValueOnce('stream boom');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const res = await performGet(
        '/search/beta/merchandising/facet',
        response
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error streaming response from merchandising API',
        new Error('stream boom')
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to stream response from merchandising API',
        status: '500',
      });
    });

    it('if 500 is not conformant to schema error should be translated to schema', async () => {
      const response = {
        status: 500,
        body: { someNonStandardProperty: 'error' },
      };
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const res = await performGet(
        '/search/beta/merchandising/facet/1',
        response
      );

      expect(httpGet).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: '{"someNonStandardProperty":"error"}',
        status: '500',
      });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('if unauthorised should return with an appropriate error', async () => {
      const response = {
        status: 401,
        body: { someNonStandardProperty: 'unauthorised' },
      };
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const res = await performGet(
        '/search/beta/merchandising/facet/1',
        response
      );

      expect(httpGet).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: '401 Unauthorized. Please login or try again',
        status: '401',
      });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('when url is undefined', async () => {
      const response = responses[0][0];
      const res = await performGet(undefined, response);

      expect(httpGet).toHaveBeenCalled();
      expect(httpGet.mock.calls[0][0].url).toBe(`${baseUrl}/?apikey=${apiKey}`);
      expect(httpGet.mock.calls[0][0].method).toBe('GET');
      expect(httpGet.mock.calls[0][0].body).toBeNull();
      expect([...httpGet.mock.calls[0][0].headers]).toEqual([]);

      expect(res.status).toHaveBeenCalledWith(response.status);
      expectSuccessfulResponseStreamed(res);
    });

    it.each(responses)(
      'forwards request to backend without Authorization for GET',
      async (response) => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = await performGet(
          '/search/beta/merchandising/facet/2',
          response
        );

        expect(httpGet).toHaveBeenCalled();
        expect(httpGet.mock.calls[0][0].url).toBe(
          `${baseUrl}/search/beta/merchandising/facet/2?apikey=${apiKey}`
        );
        expect(httpGet.mock.calls[0][0].method).toBe('GET');
        expect(httpGet.mock.calls[0][0].body).toBeNull();
        expect([...httpGet.mock.calls[0][0].headers]).toEqual([]);

        expect(res.status).toHaveBeenCalledWith(response.status);
        expectForwardedResponse(res, response);
      }
    );

    it.each(responses)(
      'forwards request to backend without Authorization for DELETE',
      async (response) => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = await performDelete(
          '/search/beta/merchandising/facet/2',
          response
        );

        expect(httpDelete).toHaveBeenCalled();
        expect(httpDelete.mock.calls[0][0].url).toBe(
          `${baseUrl}/search/beta/merchandising/facet/2?apikey=${apiKey}`
        );
        expect(httpDelete.mock.calls[0][0].method).toBe('DELETE');
        expect(httpDelete.mock.calls[0][0].body).toStrictEqual({});
        expect([...httpDelete.mock.calls[0][0].headers]).toEqual([
          ['content-type', 'application/json'],
        ]);
        expect(res.status).toHaveBeenCalledWith(response.status);
      }
    );

    it.each(responses)(
      'forwards request to backend without Authorization for POST',
      async (response) => {
        const requestBody = { another: { request: 'body' } };

        jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = await performPost(
          '/search/beta/merchandising/facet/subcategory_427',
          response,
          requestBody
        );

        expect(httpPost).toHaveBeenCalled();
        expect(httpPost.mock.calls[0][0].url).toBe(
          `${baseUrl}/search/beta/merchandising/facet/subcategory_427?apikey=${apiKey}`
        );
        expect(httpPost.mock.calls[0][0].method).toBe('POST');
        expect(await httpPost.mock.calls[0][0].body).toStrictEqual(requestBody);
        expect([...httpPost.mock.calls[0][0].headers]).toEqual([
          ['content-type', 'application/json'],
        ]);

        expect(res.status).toHaveBeenCalledWith(response.status);
        expectForwardedResponse(res, response);
      }
    );

    it('should work when process.env.MERCHANDISING_API_BASEURL is not set', async () => {
      delete process.env.MERCHANDISING_API_APIGEE_KEY;
      const response = responses[0][0];
      await performGet('/search/beta/merchandising/facet/2', response);

      expect(httpGet).toHaveBeenCalled();
      expect(httpGet.mock.calls[0][0].url).toBe(
        `${baseUrl}/search/beta/merchandising/facet/2?apikey=`
      );
    });

    it('should work when process.env.E2E_TEST_USER_TOKEN is set', async () => {
      process.env.E2E_TEST_USER_TOKEN = 'token';
      const response = responses[0][0];
      await performGet(
        `${baseUrl}/search/beta/merchandising/facet/subcategory_427`,
        response
      );

      expect(httpGet).toHaveBeenCalled();
      expect(httpGet.mock.calls[0][0].url).toBe(
        `${baseUrl}/search/beta/merchandising/facet/subcategory_427?apikey=someapikey`
      );
      delete process.env.E2E_TEST_USER_TOKEN;
    });

    it('should work when process.env.SMOKE_TEST_TOKEN is set', async () => {
      process.env.SMOKE_TEST_TOKEN = 'token';
      const response = responses[0][0];
      await performGet(
        `${baseUrl}/search/beta/merchandising/facet/subcategory_427`,
        response
      );

      expect(httpGet).toHaveBeenCalled();
      expect(httpGet.mock.calls[0][0].url).toBe(
        `${baseUrl}/search/beta/merchandising/facet/subcategory_427?apikey=someapikey`
      );
      delete process.env.SMOKE_TEST_TOKEN;
    });
  });
});
