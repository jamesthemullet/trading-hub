import { renderHook, waitFor } from '@testing-library/react';

import { type MerchandisingRules, Product } from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';

import { useProducts } from './use-products';
import { useScrollOffset } from './use-scroll-offset';

jest.mock('./use-scroll-offset', () => ({
  useScrollOffset: jest.fn(),
}));

jest.mock('@/libs/hooks', () => ({
  useCategoryProductSearch: jest.fn(),
}));

const mockProduct1: Product = {
  id: '1',
  productId: 'id1',
  title: 'name1',
  price: '1',
  imageUrl: ['url1'],
  isInStock: true,
  metadata: {
    isBlocked: false,
    isPinned: false,
  },
};

const mockProduct2: Product = {
  id: '2',
  productId: 'id2',
  title: 'name2',
  price: '2',
  imageUrl: ['url2'],
  isInStock: true,
  metadata: {
    isBlocked: false,
    isPinned: false,
  },
};

const mockProduct3: Product = {
  id: '3',
  productId: 'id3',
  title: 'name3',
  price: '3',
  imageUrl: ['url3'],
  isInStock: true,
  metadata: {
    isBlocked: false,
    isPinned: false,
  },
};

const mockProduct4: Product = {
  id: '4',
  productId: 'id4',
  title: 'name4',
  price: '4',
  imageUrl: ['url4'],
  isInStock: true,
  metadata: {
    isBlocked: false,
    isPinned: false,
  },
};

const categoryId = '1';
const productSearchTerm = 'search';
const maxToQuery = 2;
const merchandisingRules = {
  rules: [],
} as unknown as MerchandisingRules;

describe('useProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useScrollOffset).mockReturnValue({
      offset: 0,
      scrollContainerRef: { current: null },
      query: productSearchTerm,
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

  it('should return different products when productSearchTerm changes', async () => {
    const searchForProductMock = jest.fn().mockResolvedValue({
      products: [mockProduct1],
      pagination: {
        totalItems: 1,
      },
    });
    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: searchForProductMock,
      error: '',
      isLoading: false,
    });
    jest.mocked(useScrollOffset).mockReturnValue({
      offset: 0,
      scrollContainerRef: { current: null },
      query: 'search',
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
      expect(result.current.totalProducts).toEqual(1);
    });

    expect(result.current.products).toEqual([
      {
        id: '1-0',
        product: mockProduct1,
        type: 'product',
      },
    ]);

    jest.mocked(searchForProductMock).mockReturnValue({
      products: [mockProduct2, mockProduct3],
      pagination: {
        totalItems: 2,
      },
    });

    jest.mocked(useScrollOffset).mockReturnValue({
      offset: 0,
      scrollContainerRef: { current: null },
      query: 'search2',
    });

    rerender({
      categoryId,
      productSearchTerm: 'search2',
      maxToQuery,
      merchandisingRules,
    });

    await waitFor(() => {
      expect(result.current.totalProducts).toEqual(2);
    });

    expect(result.current.products).toEqual([
      {
        id: '2-0',
        product: mockProduct2,
        type: 'product',
      },
      {
        id: '3-1',
        product: mockProduct3,
        type: 'product',
      },
    ]);
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
      query: productSearchTerm,
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
        countryCode: 'UK',
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
        countryCodes: ['UK'],
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
      query: productSearchTerm,
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
        countryCodes: ['UK'],
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
