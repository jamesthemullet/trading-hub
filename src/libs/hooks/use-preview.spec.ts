import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { MerchandisingSearchPreviewResponseBeta } from '@/libs/api';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';
import { mockEmptyMerchandisingRulesWithInfo } from '@/test/data/mock-merchandising-rules-with-info';

import { usePreview } from './use-preview';

const baseUrl = 'http://localhost';
const mockCategoryId = 'abc123';

const mockSearchData: MerchandisingSearchPreviewResponseBeta = {
  products: [
    {
      id: '60275024',
      productId: 'P60275024',
      title: 'Mock Product',
      url: 'petite-round-neck-cardigan/p/clp60275023',
      price: '£17.50',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_01_T38_5762P_F0_X_EC_0',
        'SD_01_T38_5762P_F0_X_EC_0',
        'SD_01_T38_5762P_F0_X_EC_90',
        'SD_01_T38_5762P_F0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
      },
    },
  ],
  facets: [],
  category: '123',
  ruleSet: {
    facets: [],
    rules: mockEmptyMerchandisingRulesWithInfo,
  },
  externalChanges: {
    pinnedProducts: [],
    boosts: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
    buries: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
  },
  pagination: {
    totalItems: 1,
  },
};

const badResponse = {
  message: 'JSON parse error',
  status: 'Bad Request',
};

const getRuleSetPreviewMock = jest.fn();

const handlers = [
  http.post(`${baseUrl}/search/beta/merchandising/preview`, () => {
    const { data, status } = getRuleSetPreviewMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useRuleSet', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should render the hook', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockSearchData,
      status: { status: 200 },
    });

    const { result } = renderHook(() =>
      usePreview({
        categoryId: mockCategoryId,
        countryCode: 'UK',
        merchandisingRules: mockMerchandisingRules,
        facetConfig: [],
      })
    );

    const expectedData = {
      categoryProducts: [
        {
          brand: 'M&S Collection',
          id: '60275024',
          imageUrl: [
            'SD_01_T38_5762P_F0_X_EC_0',
            'SD_01_T38_5762P_F0_X_EC_0',
            'SD_01_T38_5762P_F0_X_EC_90',
            'SD_01_T38_5762P_F0_X_EC_90',
          ],
          isInStock: true,
          metadata: {
            isPinned: false,
          },
          price: '£17.50',
          title: 'Mock Product',
          url: 'petite-round-neck-cardigan/p/clp60275023',
        },
      ],
      error: '',
    };

    await waitFor(() => {
      expect(result.current.data.products).toMatchObject(
        expectedData.categoryProducts
      );
    });

    expect(result.current.data.pagination.totalItems).toBe(1);
  });

  it('should return an error when the api call fails', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() =>
      usePreview({
        countryCode: 'UK',
        searchTerm: 'foo',
        merchandisingRules: mockMerchandisingRules,
        facetConfig: [],
      })
    );

    const expectedData = {
      categoryProducts: [],
      error: 'Error JSON parse error Bad Request',
    };

    await waitFor(() => {
      expect(result.current.error).toEqual(expectedData.error);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should return an unknown error when the api call rejects with undefined', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(undefined);

    const { result } = renderHook(() =>
      usePreview({
        countryCode: 'UK',
        searchTerm: 'foo',
        merchandisingRules: mockMerchandisingRules,
        facetConfig: [],
      })
    );

    await waitFor(() => {
      expect(result.current.error).toEqual('Unknown error');
    });

    expect(result.current.isLoading).toBe(false);
    fetchSpy.mockRestore();
  });

  it('should return data for search preview', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockSearchData,
      status: { status: 200 },
    });

    const { result } = renderHook(() =>
      usePreview({
        countryCode: 'UK',
        searchTerm: 'foo',
        merchandisingRules: mockMerchandisingRules,
        facetConfig: [],
      })
    );

    const expectedData = {
      categoryProducts: [
        {
          brand: 'M&S Collection',
          id: '60275024',
          imageUrl: [
            'SD_01_T38_5762P_F0_X_EC_0',
            'SD_01_T38_5762P_F0_X_EC_0',
            'SD_01_T38_5762P_F0_X_EC_90',
            'SD_01_T38_5762P_F0_X_EC_90',
          ],
          isInStock: true,
          metadata: {
            isPinned: false,
          },
          price: '£17.50',
          title: 'Mock Product',
          url: 'petite-round-neck-cardigan/p/clp60275023',
        },
      ],
      error: '',
    };

    await waitFor(() => {
      expect(result.current.data.products).toMatchObject(
        expectedData.categoryProducts
      );
    });

    expect(result.current.data.pagination.totalItems).toBe(1);
  });

  it('should return category data for beta preview', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockSearchData,
      status: { status: 200 },
    });

    const { result } = renderHook(() =>
      usePreview({
        countryCode: 'UK',
        categoryId: mockCategoryId,
        merchandisingRules: mockMerchandisingRules,
        facetConfig: [],
      })
    );

    const expectedData = {
      categoryProducts: [
        {
          brand: 'M&S Collection',
          id: '60275024',
          imageUrl: [
            'SD_01_T38_5762P_F0_X_EC_0',
            'SD_01_T38_5762P_F0_X_EC_0',
            'SD_01_T38_5762P_F0_X_EC_90',
            'SD_01_T38_5762P_F0_X_EC_90',
          ],
          isInStock: true,
          metadata: {
            isPinned: false,
          },
          price: '£17.50',
          title: 'Mock Product',
          url: 'petite-round-neck-cardigan/p/clp60275023',
        },
      ],
      error: '',
    };

    await waitFor(() => {
      expect(result.current.data.products).toMatchObject(
        expectedData.categoryProducts
      );
    });

    expect(result.current.data.pagination.totalItems).toBe(1);
  });

  it('should return empty with no category id', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockSearchData,
      status: { status: 200 },
    });

    const { result } = renderHook(() =>
      usePreview({
        countryCode: 'UK',
        categoryId: undefined,
        merchandisingRules: mockMerchandisingRules,
        facetConfig: [],
      })
    );

    const expectedData = {
      categoryProducts: [],
      error: '',
    };

    await waitFor(() => {
      expect(result.current.data.products).toMatchObject(
        expectedData.categoryProducts
      );
    });
  });

  it('should not fetch data when isEnabled is false', async () => {
    renderHook(() =>
      usePreview({
        categoryId: mockCategoryId,
        countryCode: 'UK',
        merchandisingRules: mockMerchandisingRules,
        facetConfig: [],
        isEnabled: false,
      })
    );

    await waitFor(() => {
      expect(getRuleSetPreviewMock).not.toHaveBeenCalled();
    });
  });

  it('should refetch data', async () => {
    getRuleSetPreviewMock.mockReturnValue({
      data: mockSearchData,
      status: { status: 200 },
    });

    const newMocks: MerchandisingSearchPreviewResponseBeta = {
      ...mockSearchData,
      products: [...mockSearchData.products, mockSearchData.products[0]],
      pagination: {
        totalItems: 2,
      },
    };

    const { result } = renderHook(() =>
      usePreview({
        categoryId: mockCategoryId,
        countryCode: 'UK',
        merchandisingRules: mockMerchandisingRules,
        facetConfig: [],
      })
    );

    getRuleSetPreviewMock.mockReturnValueOnce({
      data: newMocks,
      status: { status: 200 },
    });

    act(() => {
      result.current.setFacetConfigRules([{ id: 'foo', boosted: ['Red'] }]);
    });

    await waitFor(() => {
      expect(result.current.data.products.length).toEqual(2);
    });
  });
});
