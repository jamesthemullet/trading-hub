import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

import { useFacetsList } from './use-facets-list';

const baseUrl = 'http://localhost';

const handlers = [
  http.get(`${baseUrl}/search/beta/merchandising/facet`, () => {
    return HttpResponse.json(globalFacetsListMock, { status: 200 });
  }),
];

const server = setupServer(...handlers);

describe('useFacetsList', () => {
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
    const { result } = renderHook(() => useFacetsList());

    await waitFor(() => {
      expect(result.current.facets.length).toEqual(5);
    });
  });

  it('should render the hook with error', async () => {
    server.use(
      http.get(`${baseUrl}/search/beta/merchandising/facet`, () => {
        return HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useFacetsList());

    await waitFor(() => {
      expect(result.current.error).toEqual('Internal Server Error');
    });
  });
});
