import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useCheckMergeNameUnique } from './use-check-merge-name-unique';

const baseUrl = 'http://localhost';

const IE_Values = [
  { displayValue: 'Green' },
  { displayValue: 'White' },
  { displayValue: 'Orange' },
];

const UK_Values = [
  { displayValue: 'Blue' },
  { displayValue: 'White' },
  { displayValue: 'Red' },
];

const handlers = [
  http.get(
    `${baseUrl}/search/beta/merchandising/facet/color-id/attributeValues`,
    ({ request }) => {
      const url = new URL(request.url);
      const catalogue = url.searchParams.get('catalogue');

      if (catalogue === 'MANDSIE') {
        return HttpResponse.json(
          {
            values: IE_Values,
            pagination: {
              totalItems: 3,
            },
          },
          { status: 200 }
        );
      }

      return HttpResponse.json(
        {
          values: UK_Values,
          pagination: {
            totalItems: 3,
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
    const { result } = renderHook(() => useCheckMergeNameUnique());

    await act(async () => {
      const { isUniqueValue } = await result.current.checkMergeNameUnique({
        facetId: 'color-id',
        searchQuery: 'Red',
        countryCode: 'UK',
      });

      expect(isUniqueValue).toBe(false);
    });
  });

  it('should return error', async () => {
    server.use(
      http.get(
        `${baseUrl}/search/beta/merchandising/facet/color-id/attributeValues`,
        () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        }
      )
    );

    const { result } = renderHook(() => useCheckMergeNameUnique());

    act(() => {
      result.current.checkMergeNameUnique({
        facetId: 'color-id',
        searchQuery: 'test',
        countryCode: 'UK',
      });
    });

    await waitFor(() =>
      expect(result.current.error).toEqual(
        'Failed to get Facet Attribute Values'
      )
    );
  });

  it('should work with local values', async () => {
    const { result } = renderHook(() => useCheckMergeNameUnique());

    await act(async () => {
      const { isUniqueValue } = await result.current.checkMergeNameUnique({
        facetId: 'color-id',
        searchQuery: 'test 1',
        localAttributeValues: ['test 1'],
        countryCode: 'UK',
      });

      expect(isUniqueValue).toBe(false);
    });
  });

  it('should work with multiple categories', async () => {
    const { result } = renderHook(() => useCheckMergeNameUnique());

    await act(async () => {
      const { isUniqueValue } = await result.current.checkMergeNameUnique({
        facetId: 'color-id',
        searchQuery: 'Purple',
        categories: ['IE_Cat1', 'Cat2'],
        countryCode: 'UK_IE',
      });

      expect(isUniqueValue).toBe(true);
    });
  });

  it('should return false if the value is not unique for case sensitive values', async () => {
    const { result } = renderHook(() => useCheckMergeNameUnique());

    await act(async () => {
      const { isUniqueValue } = await result.current.checkMergeNameUnique({
        facetId: 'color-id',
        searchQuery: 'test 1',
        localAttributeValues: ['Test 1'],
        countryCode: 'UK',
      });

      expect(isUniqueValue).toBe(false);
    });
  });

  it('should work with multiple countries', async () => {
    const { result } = renderHook(() => useCheckMergeNameUnique());

    await act(async () => {
      const { isUniqueValue } = await result.current.checkMergeNameUnique({
        facetId: 'color-id',
        searchQuery: 'Green',
        countryCode: 'UK_IE',
      });

      expect(isUniqueValue).toBe(false);
    });
  });

  it('should work with exceptions', async () => {
    const { result } = renderHook(() => useCheckMergeNameUnique());

    await act(async () => {
      const { isUniqueValue } = await result.current.checkMergeNameUnique({
        facetId: 'color-id',
        searchQuery: 'Red',
        exceptions: ['Red'],
        countryCode: 'UK',
      });

      expect(isUniqueValue).toBe(true);
    });
  });
});
