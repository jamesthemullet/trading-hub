import { renderHook, waitFor } from '@testing-library/react';

import { type MerchandisingRules } from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';

import { useProducts } from './use-products';
import { useScrollOffset } from './use-scroll-offset';

jest.mock('./use-scroll-offset', () => ({
  useScrollOffset: jest.fn(),
}));

jest.mock('@/libs/hooks', () => ({
  useCategoryProductSearch: jest.fn(),
}));

const mockProduct1 = {
  id: '1',
  productId: 'id1',
  name: 'name1',
  price: 1,
  imageUrl: 'url1',
  sku: 'sku1',
};

const mockProduct2 = {
  id: '2',
  productId: 'id2',
  name: 'name2',
  price: 2,
  imageUrl: 'url2',
  sku: 'sku2',
};

const mockProduct3 = {
  id: '3',
  productId: 'id3',
  name: 'name3',
  price: 3,
  imageUrl: 'url3',
  sku: 'sku3',
};

const mockProduct4 = {
  id: '4',
  productId: 'id4',
  name: 'name4',
  price: 4,
  imageUrl: 'url4',
  sku: 'sku4',
};

const categoryId = '1';
const productSearchTerm = 'search';
const maxToQuery = 2;
const merchandisingRules = {
  rules: [],
} as unknown as MerchandisingRules;

describe('useProducts', () => {
  beforeAll(() => {
    jest.mocked(useScrollOffset).mockReturnValue({
      offset: 0,
      scrollContainerRef: { current: null },
    });
    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: jest.fn().mockResolvedValue({
        products: [mockProduct1],
        pagination: {
          totalItems: 1,
        },
      }),
      error: '',
      isLoading: false,
    });
  });

  it('should return products', async () => {
    const { result } = renderHook(() =>
      useProducts({
        categoryId,
        productSearchTerm,
        maxToQuery,
        merchandisingRules,
      })
    );

    await waitFor(() => {
      expect(result.current.totalProducts).toEqual(1);
    });

    expect(result.current.products).toEqual([
      {
        id: '1-0',
        product: mockProduct1,
        type: 'product',
      },
    ]);
    expect(result.current.scrollContainerRef).toEqual({ current: null });
  });

  it('should use products size when pagination.totalItems is undefined', async () => {
    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: jest.fn().mockResolvedValue({
        products: [mockProduct1, mockProduct2],
        pagination: {
          totalItems: undefined,
        },
      }),
      error: '',
      isLoading: false,
    });

    const { result } = renderHook(() =>
      useProducts({
        categoryId,
        productSearchTerm,
        maxToQuery,
        merchandisingRules,
      })
    );

    await waitFor(() => {
      expect(result.current.totalProducts).toEqual(2);
    });

    expect(result.current.products).toEqual([
      {
        id: '1-0',
        product: mockProduct1,
        type: 'product',
      },
      {
        id: '2-1',
        product: mockProduct2,
        type: 'product',
      },
    ]);
    expect(result.current.scrollContainerRef).toEqual({ current: null });
  });

  it('should fetch more products when scrolling', async () => {
    jest.mocked(useScrollOffset).mockReturnValueOnce({
      offset: 0,
      scrollContainerRef: { current: null },
    });

    const searchForProductMock = jest.fn().mockResolvedValue({
      products: [mockProduct1, mockProduct2],
      pagination: {
        totalItems: 4,
      },
    });

    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: searchForProductMock,
      error: '',
      isLoading: false,
    });

    const { result, rerender } = renderHook(() =>
      useProducts({
        categoryId,
        productSearchTerm,
        maxToQuery,
        merchandisingRules,
      })
    );

    await waitFor(() => {
      expect(result.current.totalProducts).toEqual(4);
    });

    await waitFor(() => {
      expect(searchForProductMock).toHaveBeenLastCalledWith({
        categoryId,
        query: productSearchTerm,
        start: 0,
        rows: 2,
        merchandisingRules,
      });
    });

    expect(result.current.products).toEqual([
      {
        id: '1-0',
        product: mockProduct1,
        type: 'product',
      },
      {
        id: '2-1',
        product: mockProduct2,
        type: 'product',
      },
      {
        id: 'placeholder-2',
        type: 'placeholder',
      },
      {
        id: 'placeholder-3',
        type: 'placeholder',
      },
    ]);

    jest.mocked(useScrollOffset).mockReturnValueOnce({
      offset: 2,
      scrollContainerRef: { current: null },
    });
    const newSearchForProductMock = jest.fn().mockResolvedValue({
      products: [mockProduct3, mockProduct4],
      pagination: {
        totalItems: 4,
      },
    });
    jest.mocked(useCategoryProductSearch).mockReturnValueOnce({
      searchForProduct: newSearchForProductMock,
      error: '',
      isLoading: false,
    });

    rerender();

    await waitFor(() => {
      expect(newSearchForProductMock).toHaveBeenLastCalledWith({
        categoryId,
        query: productSearchTerm,
        start: 2,
        rows: 2,
        merchandisingRules,
      });
    });

    await waitFor(() => {
      expect(result.current.products[2].type).not.toEqual('placeholder');
    });

    expect(result.current.products).toEqual([
      {
        id: '1-0',
        product: mockProduct1,
        type: 'product',
      },
      {
        id: '2-1',
        product: mockProduct2,
        type: 'product',
      },
      {
        id: '3-2',
        product: mockProduct3,
        type: 'product',
      },
      {
        id: '4-3',
        product: mockProduct4,
        type: 'product',
      },
    ]);
  });
});
