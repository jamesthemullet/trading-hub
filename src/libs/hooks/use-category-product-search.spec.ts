import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { MerchandisingProductSearchResponse } from '@/libs/api';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { useCategoryProductSearch } from './use-category-product-search';

const baseUrl = 'http://localhost';

const getProductsMock = jest.fn();

const mockProduct = {
  id: '60529550',
  productId: '60529550',
  title: 'V-Neck Knee Length Swing Dress',
  url: 'v-neck-knee-length-smock-dress/p/clp60529552?color=BLACK&image=SD_10_T97_6310B_Y0_X_EC_90',
  price: '£125.00',
  brand: 'JAEGER',
  isInStock: true,
  imageUrl: ['SD_10_T97_6310B_Y0_X_EC_90', 'SD_10_T97_6310B_Y0_X_EC_90'],
  metadata: {
    isPinned: false,
    isBoosted: false,
    isBuried: false,
    isBlocked: false,
  },
};

const handlers = [
  http.post(`${baseUrl}/search/beta/merchandising/product`, () => {
    const { data, status } = getProductsMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

const requestSpy = jest.fn();

describe('useCategoryProductSearch', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
    server.events.on('request:start', requestSpy);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should render the hook', async () => {
    const mockResponse: MerchandisingProductSearchResponse = {
      products: [],
      pagination: {
        totalItems: 3,
      },
    };

    getProductsMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      const data = await result.current.searchForProduct({
        query: '',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK',
      });
      expect(data.pagination.totalItems).toEqual(3);
    });
  });

  it('searches by categoryId', async () => {
    const mockResponse: MerchandisingProductSearchResponse = {
      products: [mockProduct],
      pagination: {
        totalItems: 3,
      },
    };
    getProductsMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      const data = await result.current.searchForProduct({
        categories: ['1'],
        query: 'Socks',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK',
      });
      expect(data.pagination.totalItems).toEqual(3);
      expect(data.products).toEqual([mockProduct]);
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          method: 'POST',
          url: 'http://localhost/search/beta/merchandising/product?q=Socks&rows=10&start=0&categoryId=1&catalogue=MANDSUK',
        }),
      })
    );
  });

  it('should make two requests if requesting data for IE and UK', async () => {
    const mockResponse: MerchandisingProductSearchResponse = {
      products: [mockProduct, mockProduct],
      pagination: {
        totalItems: 2,
      },
    };
    const mockResponse2: MerchandisingProductSearchResponse = {
      products: [mockProduct],
      pagination: {
        totalItems: 1,
      },
    };
    getProductsMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });
    getProductsMock.mockReturnValueOnce({
      data: mockResponse2,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      const data = await result.current.searchForProduct({
        categories: ['1', 'IE_2'],
        query: 'Socks',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK_IE',
      });

      expect(data.pagination.totalItems).toEqual(2);
      expect(requestSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle undefined pagination totals', async () => {
    const mockResponse: MerchandisingProductSearchResponse = {
      products: [mockProduct, mockProduct],
      pagination: {
        totalItems: undefined,
      },
    };
    const mockResponse2: MerchandisingProductSearchResponse = {
      products: [mockProduct],
      pagination: {
        totalItems: 1,
      },
    };
    getProductsMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });
    getProductsMock.mockReturnValueOnce({
      data: mockResponse2,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      const data = await result.current.searchForProduct({
        categories: ['1', 'IE_2'],
        query: 'Socks',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK_IE',
      });

      expect(data.pagination.totalItems).toEqual(1);
      expect(requestSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('should not make two requests if requesting data for IE and UK with only an IE category', async () => {
    const mockResponse: MerchandisingProductSearchResponse = {
      products: [],
      pagination: {
        totalItems: 3,
      },
    };
    getProductsMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      await result.current.searchForProduct({
        categories: ['IE_1'],
        query: 'Socks',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK_IE',
      });
    });

    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle pagination totalItems being undefined', async () => {
    const mockResponse: MerchandisingProductSearchResponse = {
      products: [],
      pagination: {
        totalItems: undefined,
      },
    };
    getProductsMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      const data = await result.current.searchForProduct({
        searchTerms: ['foo', 'bar', 'baz'],
        query: 'Socks',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK',
      });
      expect(data.pagination.totalItems).toEqual(0);
    });
  });

  it('searches by merchandising search term', async () => {
    const mockResponse: MerchandisingProductSearchResponse = {
      products: [],
      pagination: {
        totalItems: 3,
      },
    };
    getProductsMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      const data = await result.current.searchForProduct({
        searchTerms: ['foo', 'bar', 'baz'],
        query: 'Socks',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK',
      });
      expect(data.pagination.totalItems).toEqual(3);
    });
    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          method: 'POST',
          url: 'http://localhost/search/beta/merchandising/product?q=Socks&rows=10&start=0&merchandisingSearchTerm=foo&merchandisingSearchTerm=bar&merchandisingSearchTerm=baz&catalogue=MANDSUK',
        }),
      })
    );
  });

  it('searches by productIds', async () => {
    const mockResponse: MerchandisingProductSearchResponse = {
      products: [],
      pagination: {
        totalItems: 3,
      },
    };
    getProductsMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      const data = await result.current.searchForProduct({
        productIds: ['1a', '2b'],
        query: '',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK',
      });
      expect(data.pagination.totalItems).toEqual(3);
    });
  });

  it('should render the hook with error', async () => {
    getProductsMock.mockReturnValueOnce({
      data: null,
      status: { status: 500 },
    });

    const { result, rerender } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      await result.current.searchForProduct({
        categories: ['1'],
        query: '',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK',
      });
    });

    rerender();

    expect(result.current.error).toContain('Failed to search products');
  });
});
