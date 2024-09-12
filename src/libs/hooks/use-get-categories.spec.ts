import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGetCategories } from './use-get-categories';

const categoryId1 = 'cat_123';
const categoryId2 = 'cat_456';
const categoryName = 'jeans';
const start = 5;
const rows = 10;

const pagination = { totalItems: 20 };
const categoryListDataSingleResult = {
  categories: [{ identifier: categoryId1 }],
  pagination: pagination,
};
const categoryListDataMultipleResults = {
  categories: [{ identifier: categoryId1 }, { identifier: categoryId2 }],
  pagination: pagination,
};

const getCategoriesMock = jest.fn();
const baseUrl = 'http://localhost';

const handlers = [
  http.get(`${baseUrl}/search/beta/merchandising/category`, ({ request }) => {
    const { data, status } = getCategoriesMock();
    const url = new URL(request.url);
    if (!url.searchParams.get('rows') || !url.searchParams.get('start')) {
      return new HttpResponse(null, { status: 400 });
    }
    const query = url.searchParams.get('q');
    if (query && query !== categoryId1 && query !== categoryName) {
      return new HttpResponse(null, { status: 400 });
    }
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useGetCategories', () => {
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

  it('should get categories with no query', async () => {
    getCategoriesMock.mockReturnValueOnce({
      data: categoryListDataMultipleResults,
      status: { status: 200 },
    });
    const {
      result: { current },
    } = renderHook(() => useGetCategories());

    const resp = await current.getCategories({
      start: start,
      rows: rows,
    });

    expect(resp).toEqual(categoryListDataMultipleResults);
  });

  it('should get categories with query categoryId', async () => {
    getCategoriesMock.mockReturnValueOnce({
      data: categoryListDataSingleResult,
      status: { status: 200 },
    });
    const {
      result: { current },
    } = renderHook(() => useGetCategories());

    const resp = await current.getCategories({
      query: categoryId1,
      start: start,
      rows: rows,
    });

    expect(resp).toEqual(categoryListDataSingleResult);
  });

  it('should get categories with query categoryName', async () => {
    getCategoriesMock.mockReturnValueOnce({
      data: categoryListDataMultipleResults,
      status: { status: 200 },
    });
    const {
      result: { current },
    } = renderHook(() => useGetCategories());

    const resp = await current.getCategories({
      query: categoryName,
      start: start,
      rows: rows,
    });

    expect(resp).toEqual(categoryListDataMultipleResults);
  });

  it('should return error if API returns non 200', async () => {
    getCategoriesMock.mockReturnValueOnce({
      data: {},
      error: 'api error',
      status: { status: 500 },
    });
    const { result } = renderHook(() => useGetCategories());

    await act(async () => {
      await result.current.getCategories({
        query: categoryName,
        start: start,
        rows: rows,
      });
    });

    expect(result.current.getCategoriesError).toBe('GET status 500');
  });

  it('should return error if API fails to fetch', async () => {
    getCategoriesMock.mockImplementation(() => {
      throw new Error('No data');
    });
    const { result } = renderHook(() => useGetCategories());

    await act(async () => {
      await result.current.getCategories({
        query: categoryName,
        start: start,
        rows: rows,
      });
    });

    expect(result.current.getCategoriesError).toEqual('GET status 500');
  });
});
