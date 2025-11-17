import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGetFacetAttributeValues } from './use-get-facet-attribute-values';

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
    const expectedValues = [
      {
        displayValue: 'Blue',
      },
      { displayValue: 'White' },
      { displayValue: 'Red' },
    ];

    const { result } = renderHook(() =>
      useGetFacetAttributeValues({
        countryCode: 'UK',
        categories: ['Cat1'],
        facetId: 'color-id',
        query: '',
      })
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        attributeValues: expectedValues,
        error: '',
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

    const { result } = renderHook(() =>
      useGetFacetAttributeValues({
        countryCode: 'UK_IE',
        categories: ['IE_Cat1', 'Cat2', 'IE_Cat3'],
        facetId: 'color-id',
        query: '',
      })
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        attributeValues: [],
        error: 'Error Internal Server Error Bad Request',
        isLoading: false,
      });
    });
  });

  it('should combine UK and IE category facet values', async () => {
    const expectedValues = [
      { displayValue: 'Green' },
      { displayValue: 'White' },
      { displayValue: 'Orange' },
      { displayValue: 'Blue' },
      { displayValue: 'Red' },
    ];

    const { result } = renderHook(() =>
      useGetFacetAttributeValues({
        countryCode: 'UK_IE',
        categories: ['IE_Cat1', 'Cat2', 'IE_Cat3'],
        facetId: 'color-id',
        query: 'R',
      })
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        attributeValues: expectedValues,
        error: '',
        isLoading: false,
      });
    });
  });

  it('should combine UK and IE queried facet values', async () => {
    const expectedValues = [
      { displayValue: 'Blue' },
      { displayValue: 'White' },
      { displayValue: 'Red' },
      { displayValue: 'Green' },
      { displayValue: 'Orange' },
    ];
    const { result } = renderHook(() =>
      useGetFacetAttributeValues({
        countryCode: 'UK_IE',
        query: 'e',
        facetId: 'color-id',
      })
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        attributeValues: expectedValues,
        error: '',
        isLoading: false,
      });
    });
  });

  it('should not make API calls when facetId is empty', async () => {
    const { result } = renderHook(() =>
      useGetFacetAttributeValues({
        countryCode: 'UK_IE',
        facetId: '',
        query: 'test',
        categories: ['category1'],
      })
    );

    expect(result.current).toEqual({
      attributeValues: [],
      error: '',
      isLoading: false,
    });
  });

  it('should return error when countryCode is missing', async () => {
    const { result } = renderHook(() =>
      useGetFacetAttributeValues({
        countryCode: undefined,
        facetId: 'color-id',
        query: 'test',
        categories: ['category1'],
      })
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        attributeValues: [],
        error: 'Unknown error',
        isLoading: false,
      });
    });
  });
});
