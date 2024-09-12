import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGetFacetAttributes } from '@/libs/hooks/use-get-facet-attributes';
import { attributesMock } from '@/pages/api/search/mocks';

const baseUrl = 'http://localhost';

const handlers = [
  http.get(`${baseUrl}/search/beta/merchandising/attributes`, () => {
    return HttpResponse.json(attributesMock, { status: 200 });
  }),
];

const server = setupServer(...handlers);

describe('useGetFacetsAttributes', () => {
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
    const { result } = renderHook(() => useGetFacetAttributes());

    await waitFor(() => {
      expect(result.current.error).toEqual('');
    });
  });

  it('should render the hook with error', async () => {
    server.use(
      http.get(`${baseUrl}/search/beta/merchandising/attributes`, () => {
        return HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useGetFacetAttributes());

    await waitFor(() => {
      expect(result.current.error).toEqual('Internal Server Error');
    });
  });
});
