import { renderHook } from '@testing-library/react';

import type { RuleSets } from '@/libs/api';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useCategoryProductSearch } from './use-category-product-search';

const baseUrl = 'http://localhost';
const server = setupServer();

const createRequestHandler = (response: HttpResponse) => {
  return [
    http.get(`${baseUrl}/merchandising/product`, () => {
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
    const mockResponse: RuleSets = {
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
    });
    expect(data?.pagination.totalItems).toEqual(3);
  });

  it('should render the hook with error', async () => {
    server.use(...createRequestHandler(HttpResponse.error()));

    const { result, rerender } = renderHook(() => useCategoryProductSearch());

    await result.current.handleGet({
      categoryId: '1',
      query: '',
      rows: 10,
      start: 0,
    });
    rerender();

    expect(result.current.error).toEqual(
      'Failed to create ruleset TypeError: Failed to fetch'
    );
  });
});
