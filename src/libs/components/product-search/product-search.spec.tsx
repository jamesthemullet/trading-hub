import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCategoryProductSearch } from '@/libs/hooks';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { ProductSearch } from './product-search';

const PLACEHOLDER_TEXT = 'Search for product';

jest.mock('@/libs/hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));

const mockDispatch = jest.fn();

describe('ProductSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render rules search', () => {
    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [],
          pagination: {
            totalItems: 1,
          },
        });
      }),
      error: '',
      isLoading: false,
    });
    render(
      <ProductSearch
        isPinnable
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        merchandisingRules={mockMerchandisingRules}
      />
    );

    expect(screen.getByPlaceholderText(PLACEHOLDER_TEXT)).toBeInTheDocument();
  });

  it('should render products', async () => {
    const user = userEvent.setup({ delay: null });
    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: '1',
              productId: 'id1',
              title: 'title',
              imageUrl: ['example1.jpg'],
              brand: 'brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£5',
              url: '',
            },
          ],
          pagination: {
            totalItems: 1,
          },
        });
      }),
      error: '',
      isLoading: false,
    });

    render(
      <ProductSearch
        isPinnable
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        merchandisingRules={mockMerchandisingRules}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText(/title/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/brand/i)).toBeInTheDocument();
    expect(screen.getByText(/£5/i)).toBeInTheDocument();
  });

  it('should render no products when search is cleared', async () => {
    const user = userEvent.setup({ delay: null });
    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: '1',
              productId: 'id1',
              title: 'title',
              imageUrl: ['example1.jpg'],
              brand: 'brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£5',
              url: '',
            },
          ],
          pagination: {
            totalItems: 1,
          },
        });
      }),
      error: '',
      isLoading: false,
    });

    render(
      <ProductSearch
        isPinnable
        categoryId="cat123"
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        merchandisingRules={mockMerchandisingRules}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText(/title/i)).toBeInTheDocument();
    });

    await user.clear(searchProduct);

    await waitFor(() => {
      expect(screen.getByText('0 results')).toBeVisible();
    });
  });

  it('should respond to typing', async () => {
    const user = userEvent.setup({ delay: null });
    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: '1',
              productId: 'id1',
              title: 'title',
              imageUrl: ['example1.jpg'],
              brand: 'brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£5',
              url: '',
            },
            {
              id: '2',
              productId: 'id2',
              title: 'title2',
              imageUrl: ['example2.jpg'],
              brand: 'brand2',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£10',
              url: '',
            },
            {
              id: '3',
              productId: 'id3',
              title: 'title3',
              imageUrl: ['example3.jpg'],
              brand: 'brand3',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£15',
              url: '',
            },
          ],
          pagination: {
            totalItems: 1,
          },
        });
      }),
      error: '',
      isLoading: false,
    });

    render(
      <ProductSearch
        isPinnable
        dispatch={mockDispatch}
        pinnedProductsCount={3}
        merchandisingRules={mockMerchandisingRules}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('3 results')).toBeInTheDocument();
    });
  });
});
