import type { DefaultBodyType, PathParams } from 'msw';
import { http, HttpResponse } from 'msw';
import type { HttpRequestResolverExtras } from 'msw/lib/core/handlers/HttpHandler';
import type { ResponseResolverInfo } from 'msw/lib/core/handlers/RequestHandler';
import { setupServer } from 'msw/node';

import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';
import { createMockNextApiResponse } from '@/test/create-mock-next-api-response';

import { getToken } from 'next-auth/jwt';

import type { MerchandisingEnvironment } from './[...search].page';
import proxy from './[...search].page';
import { validateAndMockResponse } from './mocks-support';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

jest.mock('./mocks-support', () => ({
  validateAndMockResponse: jest.fn(),
}));

const httpGet = jest.fn();
const httpPost = jest.fn();
const httpDelete = jest.fn();

const captureRequest =
  (fn: jest.Mock) =>
  async ({
    request,
  }: ResponseResolverInfo<
    HttpRequestResolverExtras<PathParams>,
    DefaultBodyType
  >) => {
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

const responses: Response[][] = [
  [{ status: 200, body: { hello: 'world', products: [] } }],
  [{ status: 500, body: { message: 'error', status: '500' }, envSettings: {} }],
  [{ status: 500, body: { message: 'error', status: '500' } }],
  [{ status: 200, body: { rules: {} } }],
];

const performGet = async (url: string | undefined, response: Response) => {
  const req = createMockNextApiRequest({
    url,
    method: 'GET',
  });

  const res = createMockNextApiResponse(req);
  httpGet.mockReturnValue(
    HttpResponse.json(response.body, { status: response.status })
  );

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

describe('Search api proxy', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_API_BASEURL = baseUrl;
    process.env.MERCHANDISING_API_APIGEE_KEY = apiKey;
    server.listen();
  });

  beforeEach(() => {
    jest
      .mocked(validateAndMockResponse)
      .mockImplementation((_req, status, jsonBody) => {
        return {
          updatedJsonBody: jsonBody,
          updatedStatus: status,
        };
      });
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
        expect(res.json).toHaveBeenCalledWith(response.body);
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
        expect(res.json).toHaveBeenCalledWith(response.body);
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
        expect(httpDelete.mock.calls[0][0].body).toBeNull();
        expect([...httpDelete.mock.calls[0][0].headers]).toEqual([
          ['authorization', 'Bearer token'],
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
      expect(httpDelete.mock.calls[0][0].body).toBeNull();
      expect([...httpDelete.mock.calls[0][0].headers]).toEqual([
        ['authorization', 'Bearer token'],
      ]);

      expect(res.status).toHaveBeenCalledWith(response.status);
      expect(res.json).toHaveBeenCalledWith({});
    });
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      jest.mocked(getToken).mockResolvedValueOnce(null);
      jest
        .mocked(validateAndMockResponse)
        .mockImplementation((_req, status, jsonBody) => {
          return {
            updatedJsonBody: jsonBody,
            updatedStatus: status,
          };
        });
    });

    it('when url is equal to /search/beta/merchandising/facet', async () => {
      const response = responses[0][0];
      const res = await performGet(
        '/search/beta/merchandising/facet?query=nonexisting',
        response
      );

      expect(httpGet).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(validateAndMockResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/search/beta/merchandising/facet?query=nonexisting',
        }),
        200,
        response.body
      );
      expect(res.json).toHaveBeenCalledWith({
        products: [],
        hello: 'world',
      });
    });

    it('should fail with 500 when validateAndMockResponse fails', async () => {
      jest.mocked(validateAndMockResponse).mockImplementation(() => {
        return { error: 'No url or method found in request' };
      });
      const response = {
        status: 200,
        body: { someNonExistingSchema: 123 },
      };
      const res = await performGet(
        '/search/beta/merchandising/facet/1',
        response
      );

      expect(httpGet).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No url or method found in request',
        status: '500',
      });
    });

    it('if 500 is not conformant to schema error should be translated to schema', async () => {
      const response = {
        status: 500,
        body: { someNonStandardProperty: 'error' },
      };
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
      expect(res.json).toHaveBeenCalledWith(response.body);
    });

    it.each(responses)(
      'forwards request to backend without Authorization for GET',
      async (response) => {
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
        expect(res.json).toHaveBeenCalledWith(response.body);
      }
    );

    it.each(responses)(
      'forwards request to backend without Authorization for DELETE',
      async (response) => {
        const res = await performDelete(
          '/search/beta/merchandising/facet/2',
          response
        );

        expect(httpDelete).toHaveBeenCalled();
        expect(httpDelete.mock.calls[0][0].url).toBe(
          `${baseUrl}/search/beta/merchandising/facet/2?apikey=${apiKey}`
        );
        expect(httpDelete.mock.calls[0][0].method).toBe('DELETE');
        expect(httpDelete.mock.calls[0][0].body).toBeNull();
        expect([...httpDelete.mock.calls[0][0].headers]).toEqual([]);

        expect(res.status).toHaveBeenCalledWith(response.status);
      }
    );

    it.each(responses)(
      'forwards request to backend without Authorization for POST',
      async (response) => {
        const requestBody = { another: { request: 'body' } };
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
        expect(res.json).toHaveBeenCalledWith(response.body);
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
        `${baseUrl}/search/beta/merchandising/facet/subcategory_427?apikey=`
      );
      delete process.env.E2E_TEST_USER_TOKEN;
    });
  });
});
