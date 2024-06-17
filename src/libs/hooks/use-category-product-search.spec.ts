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
};

const createRequestHandler = (response: HttpResponse) => {
  return [
    http.post(`${baseUrl}/merchandising/product`, () => {
      return response;
    }),
  ];
};

describe('useCategoryProductSearch', () => {
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
    const mockResponse: ReturnedCategoryRuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: 3,
      },
    };
    server.use(...createRequestHandler(HttpResponse.json(mockResponse)));

    const { result } = renderHook(() => useCategoryProductSearch());

    const data = await result.current.handleGet({
      categoryId: '1',
      query: '',
      rows: 10,
      start: 0,
      merchandisingRules: mockMerchandisingRules,
    });
    expect(data?.pagination.totalItems).toEqual(3);
  });

  it('should render the hook with error', async () => {
    server.use(...createRequestHandler(HttpResponse.error()));

    const { result, rerender } = renderHook(() => useCategoryProductSearch());

    await act(async () => {
      await result.current.handleGet({
        categoryId: '1',
        query: '',
        rows: 10,
        start: 0,
        merchandisingRules: mockMerchandisingRules,
      });
    });

    rerender();

    expect(result.current.error).toEqual(
      'Failed to search products TypeError: Failed to fetch'
    );
  });
});
