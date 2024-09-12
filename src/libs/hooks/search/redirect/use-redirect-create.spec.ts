import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { redirectMock, returnedRedirectMock } from '@/pages/api/search/mocks';

import { useRedirectCreate } from './use-redirect-create';

const getRedirectCreateMock = jest.fn();

const baseUrl = 'http://localhost';
const handlers = [
  http.post(`${baseUrl}/search/beta/merchandising/keyword/redirect`, () => {
    const { data, status, error } = getRedirectCreateMock();
    if (error) {
      return HttpResponse.error();
    }
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useRedirectCreate', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should create a new ruleset', async () => {
    getRedirectCreateMock.mockReturnValueOnce({
      data: returnedRedirectMock,
      status: { status: 200 },
    });
    const {
      result: { current },
    } = renderHook(() => useRedirectCreate());

    await act(async () => {
      const resp = await current.createRedirect({ redirect: redirectMock });

      expect(resp).toEqual(returnedRedirectMock);
    });
  });

  it('should return errors', async () => {
    getRedirectCreateMock.mockReturnValueOnce({
      data: {},
      error: 'error',
      status: { status: 500 },
    });
    const { result } = renderHook(() => useRedirectCreate());

    await act(async () => {
      await result.current.createRedirect({ redirect: redirectMock });
    });

    expect(result.current.error).toBe('Unknown error');
  });
});
