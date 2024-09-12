import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { redirectMock } from '@/pages/api/search/mocks';

import { useRedirectUpdate } from './use-redirect-update';

const baseUrl = 'http://localhost';

const mockRedirectId = 'qfwq2r-32f23-23ewfw-233r3';
const handlers = [
  http.put(
    `${baseUrl}/search/beta/merchandising/keyword/redirect/${mockRedirectId}`,
    () => {
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
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should render the hook', async () => {
    const { result } = renderHook(() => useRedirectUpdate());

    act(() => {
      result.current.updateRedirect({
        redirectId: mockRedirectId,
        redirect: redirectMock,
      });
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBeTruthy();
    });
  });

  it('should render the hook with error', async () => {
    server.use(
      http.put(
        `${baseUrl}/search/beta/merchandising/keyword/redirect/${mockRedirectId}`,
        () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        }
      )
    );

    const { result } = renderHook(() => useRedirectUpdate());

    act(() => {
      result.current.updateRedirect({
        redirectId: mockRedirectId,
        redirect: redirectMock,
      });
    });

    await waitFor(() => {
      expect(result.current.error).toEqual('PUT status 500');
    });
  });
});
