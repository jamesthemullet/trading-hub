import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { ReturnedCategoryRuleSets } from '@/libs/api';

import { useCategoryProductSearch } from './use-category-product-search';

const baseUrl = 'http://localhost';
const server = setupServer();

const mockMerchandisingRules = {
  pinnedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  blockedProducts: [],
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};

const createRequestHandler = (response: HttpResponse) => {
  return [
    http.post(`${baseUrl}/search/beta/merchandising/product`, () => {
      return response;
    }),
  ];
};
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
    const mockResponse: ReturnedCategoryRuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: 3,
      },
    };
    server.use(...createRequestHandler(HttpResponse.json(mockResponse)));

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
    const mockResponse: ReturnedCategoryRuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: 3,
      },
    };
    server.use(...createRequestHandler(HttpResponse.json(mockResponse)));

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      const data = await result.current.searchForProduct({
        categoryId: '1',
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
          url: 'http://localhost/search/beta/merchandising/product?q=Socks&rows=10&start=0&categoryId=1&catalogue=MANDSUK',
        }),
      })
    );
  });

  it('should make two requests if requesting data for IE and UK', async () => {
    const mockResponse: ReturnedCategoryRuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: 3,
      },
    };
    server.use(...createRequestHandler(HttpResponse.json(mockResponse)));

    const { result } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      await result.current.searchForProduct({
        categoryId: '1',
        query: 'Socks',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK_IE',
      });
    });

    expect(requestSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle pagination totalItems being undefined', async () => {
    const mockResponse: ReturnedCategoryRuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: undefined,
      },
    };
    server.use(...createRequestHandler(HttpResponse.json(mockResponse)));

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
    const mockResponse: ReturnedCategoryRuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: 3,
      },
    };
    server.use(...createRequestHandler(HttpResponse.json(mockResponse)));

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
    const mockResponse: ReturnedCategoryRuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: 3,
      },
    };
    server.use(...createRequestHandler(HttpResponse.json(mockResponse)));

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
    server.use(...createRequestHandler(HttpResponse.error()));

    const { result, rerender } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      await result.current.searchForProduct({
        categoryId: '1',
        query: '',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK',
      });
    });

    rerender();

    expect(result.current.error).toEqual(
      'Failed to search products TypeError: Failed to fetch'
    );
  });
});
