import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Product } from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { renderWithProviders } from '../../../test/render-with-providers';
import { ProductSearch, ProductSearchProps } from './product-search';

const PLACEHOLDER_TEXT = 'Search for product';

jest.mock('@/libs/hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));

const mockDispatch = jest.fn();

const mockProps: ProductSearchProps = {
  isPinnable: true,
  merchandisingRules: mockMerchandisingRules,
  hasBulkAction: false,
  isSelectionDisabled: false,
  onSelectAll: jest.fn(),
  dispatch: jest.fn(),
  pinnedProductsCount: 0,
  onSelectProduct: jest.fn(),
  selectedProducts: [],
};

describe('ProductSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render product search', () => {
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
    renderWithProviders(
      <ProductSearch
        {...mockProps}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
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

    renderWithProviders(
      <ProductSearch
        {...mockProps}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
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

    renderWithProviders(
      <ProductSearch
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
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
            totalItems: 3,
          },
        });
      }),
      error: '',
      isLoading: false,
    });

    renderWithProviders(
      <ProductSearch
        {...mockProps}
        dispatch={mockDispatch}
        pinnedProductsCount={3}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('3 results')).toBeInTheDocument();
    });
  });

  it('should render placeholder', async () => {
    const user = userEvent.setup({ delay: null });
    const mockCategories = ['cat123'];
    const searchForProductMock = jest.fn(() => {
      return Promise.resolve({
        products: Array.from({ length: 10 }).map(
          (_, index) =>
            ({
              id: `${index}`,
              productId: `id${index}`,
              title: 'title',
              imageUrl: ['example1.jpg'],
              brand: 'brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£5',
              url: '',
            }) satisfies Product
        ),
        pagination: {
          totalItems: 25,
        },
      });
    });
    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: searchForProductMock,
      error: '',
      isLoading: false,
    });

    renderWithProviders(
      <ProductSearch
        {...mockProps}
        categoryIds={mockCategories}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await act(async () => {
      await user.type(searchProduct, 'productSearchTitle');
    });

    await waitFor(() => {
      expect(searchForProductMock).toHaveBeenLastCalledWith({
        categories: mockCategories,
        query: 'productSearchTitle',
        start: 0,
        rows: 10,
        merchandisingRules: mockMerchandisingRules,
        countryCode: 'UK_IE',
      });
    });

    await waitFor(() => {
      expect(screen.getByLabelText('placeholder-11')).toBeInTheDocument();
    });
  });

  it('should select all', async () => {
    const user = userEvent.setup({ delay: null });

    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: '1',
              productId: 'id1',
              title: 'mock title 1',
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
              title: 'mock title 2',
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
              title: 'mock title 3',
              imageUrl: ['example3.jpg'],
              brand: 'brand3',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£15',
              url: '',
            },
          ],
          pagination: {
            totalItems: 3,
          },
        });
      }),
      error: '',
      isLoading: false,
    });

    const mockSelectAll = jest.fn();

    renderWithProviders(
      <ProductSearch
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        hasBulkAction
        onSelectAll={mockSelectAll}
      />,
      [],
      {
        featureFlags: {
          hasBulkActions: true,
        },
      }
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('3 results')).toBeInTheDocument();
    });

    const checkbox = await screen.findByLabelText('Select all');

    act(() => {
      checkbox.click();
    });

    expect(mockSelectAll).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('should deselect all', async () => {
    const user = userEvent.setup({ delay: null });

    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: Array.from({ length: 10 }).map(
            (_, index) =>
              ({
                id: `${index}`,
                productId: `id${index}`,
                title: `mock title ${index}`,
                imageUrl: ['example1.jpg'],
                brand: 'brand',
                metadata: { isPinned: false },
                isInStock: true,
                price: '£5',
                url: '',
              }) satisfies Product
          ),
          pagination: {
            totalItems: 25,
          },
        });
      }),
      error: '',
      isLoading: false,
    });

    const mockSelectAll = jest.fn();

    renderWithProviders(
      <ProductSearch
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        hasBulkAction
        onSelectAll={mockSelectAll}
        selectedProducts={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']}
      />,
      [],
      {
        featureFlags: {
          hasBulkActions: true,
        },
      }
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('25 results')).toBeInTheDocument();
    });

    const checkbox = await screen.findByLabelText('Select all');

    act(() => {
      checkbox.click();
    });

    expect(mockSelectAll).toHaveBeenCalledWith([]);
  });
});
