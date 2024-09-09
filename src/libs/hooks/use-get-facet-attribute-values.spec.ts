import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { attributeValuesMock } from '@/pages/api/merchandising/mocks';

import { useGetFacetAttributeValues } from './use-get-facet-attribute-values';

const baseUrl = 'http://localhost';

const handlers = [
  http.get(
    `${baseUrl}/search/beta/merchandising/facet/color-id/attributeValues`,
    () => {
      return HttpResponse.json(
        {
          values: attributeValuesMock,
          pagination: {
            totalItems: 5,
          },
        },
        { status: 200 }
      );
    }
  ),
];

const server = setupServer(...handlers);

describe('useGetFacetAttributeValues', () => {
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
    const { result } = renderHook(() => useGetFacetAttributeValues('color-id'));

    await waitFor(() => {
      expect(result.current).toEqual({
        attributeValues: attributeValuesMock,
        error: '',
        pagination: {
          totalItems: 5,
        },
        refetch: expect.any(Function),
        isLoading: false,
      });
    });
  });

  it('should return error', async () => {
    server.use(
      http.get(
        `${baseUrl}/search/beta/merchandising/facet/color-id/attributeValues`,
        () => {
          return HttpResponse.json(
            { message: 'Internal Server Error', status: 'Bad Request' },
            { status: 500 }
          );
        }
      )
    );

    const { result } = renderHook(() => useGetFacetAttributeValues('color-id'));

    await waitFor(() => {
      expect(result.current).toEqual({
        attributeValues: [],
        pagination: {
          totalItems: 0,
        },
        error: 'Error Internal Server Error Bad Request',
        refetch: expect.any(Function),
        isLoading: false,
      });
    });
  });

  it('should refetch data', async () => {
    const { result } = renderHook(() => useGetFacetAttributeValues('color-id'));

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.pagination.totalItems).toEqual(5);
    });
  });
});
