import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useSearchRedirectList } from './use-redirect-list';

const baseUrl = 'http://localhost';

const handlers = [
  http.get(`${baseUrl}/search/beta/merchandising/keyword/redirect`, () => {
    return HttpResponse.json(
      {
        pagination: { totalItems: 1 },
        redirects: [
          {
            id: '1',
            identifier: 'mens summer shirts | mens summer shirt',
            isEnabled: true,
            lastChanged: {
              date: '2024-08-01',
              user: 'John Doe',
            },
            url: '/search/redirects/edit/1',
          },
        ],
      },
      { status: 200 }
    );
  }),
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
    const { result } = renderHook(() => useSearchRedirectList('', 0, 10));

    act(() => {
      result.current.refetchRedirectList();
    });

    await waitFor(() => {
      expect(result.current.redirects.length).toEqual(1);
    });
  });

  it('should render the hook with error', async () => {
    server.use(
      http.get(`${baseUrl}/search/beta/merchandising/keyword/redirect`, () => {
        return HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useSearchRedirectList('', 0, 50));

    await waitFor(() => {
      expect(result.current.error).toEqual('Internal Server Error');
    });
  });
});
