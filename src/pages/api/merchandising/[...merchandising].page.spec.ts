import type { DefaultBodyType, PathParams } from 'msw';
import { http, HttpResponse } from 'msw';
import type { HttpRequestResolverExtras } from 'msw/lib/core/handlers/HttpHandler';
import type { ResponseResolverInfo } from 'msw/lib/core/handlers/RequestHandler';
import { setupServer } from 'msw/node';
import { getToken } from 'next-auth/jwt';

import type { MerchandisingEnvironment } from './[...merchandising].page';
import proxy from './[...merchandising].page';
import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';
import { createMockNextApiResponse } from '@/test/create-mock-next-api-response';
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
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
  // [{ status: 200, body: { hello: 'world' }, envSettings: {} }],
  [{ status: 200, body: { hello: 'world' } }],
  // [{ status: 200, body: { hello: 'world' } }],
  // [{ status: 500, body: { hello: 'error' }, envSettings: {} }],
  // [{ status: 500, body: { hello: 'error' } }],
];

const performGet = async (
  url: string | undefined,
  response: Response
  // envSettings?: Partial<MerchandisingEnvironment>
) => {
  const req = createMockNextApiRequest({
    url,
    method: 'GET',
  });

  const res = createMockNextApiResponse(req);
  httpGet.mockReturnValue(
    HttpResponse.json(response.body, { status: response.status })
  );

  // await (envSettings ? proxy(req, res, envSettings) : proxy(req, res));
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

describe.skip('Merchandising api proxy', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_API_BASEURL = baseUrl;
    server.listen();
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
      jest.mocked(getToken).mockResolvedValueOnce({ accessToken: 'token' });
    });

    it.only.each(responses)(
      'forwards request to backend with Authorization for GET',
      async (response) => {
        const res = await performGet(
          '/api/merchandising/category/1',
          response
          // response.envSettings
        );

        expect(httpGet).toHaveBeenCalled();
        // expect(httpGet.mock.calls[0][0].url).toBe(
        //   `${baseUrl}/merchandising/category/1`
        // );
        // expect(httpGet.mock.calls[0][0].method).toBe('GET');
        // expect(httpGet.mock.calls[0][0].body).toBeNull();
        // expect([...httpGet.mock.calls[0][0].headers]).toEqual([
        //   ['authorization', 'Bearer token'],
        // ]);

        // expect(res.status).toHaveBeenCalledWith(response.status);
        // expect(res.json).toHaveBeenCalledWith(response.body);
      }
    );

    it.each(responses)(
      'forwards request to backend with Authorization for POST',
      async (response) => {
        const requestBody = { a: { request: 'body' } };
        const res = await performPost(
          '/api/merchandising/preview/subcategory_429',
          response,
          requestBody
        );
        expect(httpPost).toHaveBeenCalled();
        expect(httpPost.mock.calls[0][0].url).toBe(
          `${baseUrl}/merchandising/preview/subcategory_429`
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
      'forwards request to backend with Authorization for DELTE',
      async (response) => {
        const res = await performDelete(
          '/api/merchandising/category/1',
          response
        );

        expect(httpDelete).toHaveBeenCalled();
        expect(httpDelete.mock.calls[0][0].url).toBe(
          `${baseUrl}/merchandising/category/1`
        );
        expect(httpDelete.mock.calls[0][0].method).toBe('DELETE');
        expect(httpDelete.mock.calls[0][0].body).toBeNull();
        expect([...httpDelete.mock.calls[0][0].headers]).toEqual([
          ['authorization', 'Bearer token'],
        ]);

        expect(res.status).toHaveBeenCalledWith(response.status);
      }
    );
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      jest.mocked(getToken).mockResolvedValueOnce(null);
    });

    it('when url is equal to /api/merchandising/product', async () => {
      const response = responses[0][0];
      const res = await performGet(
        '/api/merchandising/product?query=nonexisting',
        response
      );

      expect(httpGet).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        products: [],
        pagination: {
          totalItems: 0,
        },
      });
    });

    it('when url is undefined', async () => {
      const response = responses[0][0];
      const res = await performGet(undefined, response);

      expect(httpGet).toHaveBeenCalled();
      expect(httpGet.mock.calls[0][0].url).toBe(`${baseUrl}/`);
      expect(httpGet.mock.calls[0][0].method).toBe('GET');
      expect(httpGet.mock.calls[0][0].body).toBeNull();
      expect([...httpGet.mock.calls[0][0].headers]).toEqual([]);

      expect(res.status).toHaveBeenCalledWith(response.status);
      expect(res.json).toHaveBeenCalledWith(response.body);
    });

    it.each(responses)(
      'forwards request to backend without Authorization for GET',
      async (response) => {
        const res = await performGet('/api/merchandising/category/2', response);

        expect(httpGet).toHaveBeenCalled();
        expect(httpGet.mock.calls[0][0].url).toBe(
          `${baseUrl}/merchandising/category/2`
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
          '/api/merchandising/category/2',
          response
        );

        expect(httpDelete).toHaveBeenCalled();
        expect(httpDelete.mock.calls[0][0].url).toBe(
          `${baseUrl}/merchandising/category/2`
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
          '/api/merchandising/preview/subcategory_427',
          response,
          requestBody
        );

        expect(httpPost).toHaveBeenCalled();
        expect(httpPost.mock.calls[0][0].url).toBe(
          `${baseUrl}/merchandising/preview/subcategory_427`
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
  });
});
