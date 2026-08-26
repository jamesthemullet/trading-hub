import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { redirectMock } from '@/pages/api/search/mocks';

import { useRedirectUpdate } from './use-redirect-update';

const baseUrl = 'http://localhost';
const redirectId = 'qfwq2r-32f23-23ewfw-233r3';

const betaHandler = jest.fn();
const v1Handler = jest.fn();

const handlers = [
  http.put(
    `${baseUrl}/search/beta/merchandising/keyword/redirect/${redirectId}`,
    async ({ request }) => {
      betaHandler(await request.json());
      return HttpResponse.json({}, { status: 200 });
    }
  ),
  http.put(
    `${baseUrl}/search/merchandising/v1/CLOTHING_AND_HOME/keyword/redirect/${redirectId}`,
    async ({ request }) => {
      v1Handler(await request.json());
      return HttpResponse.json({}, { status: 200 });
    }
  ),
];

const server = setupServer(...handlers);

describe('useRedirectUpdate', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('updates via the beta endpoint by default', async () => {
    const { result } = renderHook(() => useRedirectUpdate());

    let res;
    await act(async () => {
      res = await result.current.updateRedirect({
        redirectId,
        redirect: redirectMock,
      });
    });

    expect(res).toEqual({ status: 'success' });
    expect(betaHandler).toHaveBeenCalled();
    expect(v1Handler).not.toHaveBeenCalled();
  });

  it('updates via the v1 endpoint with the version when enabled', async () => {
    const { result } = renderHook(() => useRedirectUpdate());

    let res;
    await act(async () => {
      res = await result.current.updateRedirect({
        redirectId,
        redirect: redirectMock,
        version: 2,
        shouldUseV1: true,
      });
    });

    expect(res).toEqual({ status: 'success' });
    expect(v1Handler).toHaveBeenCalledWith(
      expect.objectContaining({ version: 2 })
    );
    expect(betaHandler).not.toHaveBeenCalled();
  });
});
