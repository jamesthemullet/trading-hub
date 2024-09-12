import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { globalFacetsListMock } from '@/pages/api/search/mocks';

import { useGetFacetsById } from './use-get-facet-by-id';

const baseUrl = 'http://localhost';

const handlers = [
  http.get(`${baseUrl}/search/beta/merchandising/facet/color-id`, () => {
    return HttpResponse.json(globalFacetsListMock.facets[0], { status: 200 });
  }),
];

const server = setupServer(...handlers);

describe('useGetFacetsById', () => {
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
    const { result } = renderHook(() => useGetFacetsById('color-id'));

    await waitFor(() => {
      expect(result.current).toEqual({
        facet: globalFacetsListMock.facets[0],
        error: '',
      });
    });
  });

  it('should render the hook and return nothing', async () => {
    const { result } = renderHook(() => useGetFacetsById(''));

    await waitFor(() => {
      expect(result.current).toEqual({ facet: undefined, error: '' });
    });
  });

  it('should render the hook with error', async () => {
    server.use(
      http.get(`${baseUrl}/search/beta/merchandising/facet/color-id`, () => {
        return HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useGetFacetsById('color-id'));

    await waitFor(() => {
      expect(result.current.error).toEqual('Internal Server Error');
    });
  });
});
