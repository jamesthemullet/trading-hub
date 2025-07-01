import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { MerchandisingProduct } from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { renderWithProviders } from '../../../../test/render-with-providers';
import type { ProductSearchProps } from './product-search-all';
import { ProductSearchAll } from './product-search-all';

const PLACEHOLDER_TEXT = 'Search for product';

jest.mock('@/libs/hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));

const mockDispatch = jest.fn();

const mockProps: ProductSearchProps = {
  isPinnable: true,
  merchandisingRules: mockMerchandisingRules,
  isSelectionDisabled: false,
  onSelectAll: jest.fn(),
  dispatch: jest.fn(),
  pinnedProductsCount: 0,
  onSelectProduct: jest.fn(),
  selectedProducts: [],
  rulesetType: 'category',
};

describe('ProductSearchAll', () => {
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
    renderWithProviders(<ProductSearchAll {...mockProps} />);

    expect(screen.getByPlaceholderText(PLACEHOLDER_TEXT)).toBeInTheDocument();
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
      <ProductSearchAll
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

  it('should search with category ids', async () => {
    const user = userEvent.setup({ delay: null });

    const mockSearch = jest.fn(() => {
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
        ],
        pagination: {
          totalItems: 3,
        },
      });
    });

    const expectedCall = {
      categories: ['cat123'],
      countryCode: 'UK_IE',
      merchandisingRules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [],
      },
      query: 'productSearchTitle',
      rows: 400,
      start: 0,
    };

    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: mockSearch,
      error: '',
      isLoading: false,
    });

    const mockSelectAll = jest.fn();

    renderWithProviders(
      <ProductSearchAll
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        onSelectAll={mockSelectAll}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    expect(mockSearch).toHaveBeenCalledWith(expectedCall);
  });

  it('should add a space after comma for multiple product queries', async () => {
    const user = userEvent.setup({ delay: null });

    const queryMade = '60371013,22473506,   60089757  ,60286681';
    const expectedQuery = '60371013, 22473506, 60089757, 60286681';

    const mockSearch = jest.fn(() => {
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
        ],
        pagination: {
          totalItems: 3,
        },
      });
    });

    const expectedCall = {
      categories: ['cat123'],
      countryCode: 'UK_IE',
      merchandisingRules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [],
      },
      query: expectedQuery,
      rows: 400,
      start: 0,
    };

    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: mockSearch,
      error: '',
      isLoading: false,
    });

    const mockSelectAll = jest.fn();

    renderWithProviders(
      <ProductSearchAll
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        onSelectAll={mockSelectAll}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, queryMade);

    await waitFor(() => {
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    expect(mockSearch).toHaveBeenCalledWith(expectedCall);
  });

  it('should search with search terms', async () => {
    const user = userEvent.setup({ delay: null });

    const mockSearch = jest.fn(() => {
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
        ],
        pagination: {
          totalItems: 3,
        },
      });
    });

    const expectedCall = {
      searchTerms: ['dress', 'dresses'],
      countryCode: 'UK_IE',
      merchandisingRules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [],
      },
      query: 'productSearchTitle',
      rows: 400,
      start: 0,
    };

    jest.mocked(useCategoryProductSearch).mockReturnValue({
      searchForProduct: mockSearch,
      error: '',
      isLoading: false,
    });

    const mockSelectAll = jest.fn();

    renderWithProviders(
      <ProductSearchAll
        {...mockProps}
        searchTerms={['dress', 'dresses']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        onSelectAll={mockSelectAll}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    expect(mockSearch).toHaveBeenCalledWith(expectedCall);
  });

  it('should remove previous products when search is cleared', async () => {
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
      <ProductSearchAll
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        rulesetType="global"
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    await user.clear(searchProduct);

    await waitFor(() => {
      expect(screen.queryByText('1 result')).not.toBeInTheDocument();
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
      <ProductSearchAll
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        onSelectAll={mockSelectAll}
      />
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
              }) satisfies MerchandisingProduct
          ),
          pagination: {
            totalItems: 10,
          },
        });
      }),
      error: '',
      isLoading: false,
    });

    const mockSelectAll = jest.fn();

    renderWithProviders(
      <ProductSearchAll
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
        onSelectAll={mockSelectAll}
        selectedProducts={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('10 results')).toBeInTheDocument();
    });

    const checkbox = await screen.findByLabelText('Select all');

    act(() => {
      checkbox.click();
    });

    expect(mockSelectAll).toHaveBeenCalledWith([]);
  });

  it('should display predicted revenue and newness score in the search results', async () => {
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
              metadata: {
                isPinned: false,
                ranking: [
                  {
                    property: 'Predicted Revenue Score:',
                    values: ['11.59'],
                  },
                  {
                    property: 'Days Since Launch:',
                    values: ['100'],
                  },
                ],
              },
              isInStock: true,
              price: '£5',
              url: '',
              predictedRevenue: 0.5,
              newnessScore: 0.5,
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
      <ProductSearchAll
        {...mockProps}
        categoryIds={['cat123']}
        dispatch={mockDispatch}
        pinnedProductsCount={0}
      />
    );

    const searchProduct = screen.getByPlaceholderText('Search for product');

    await user.type(searchProduct, 'productSearchTitle');

    await waitFor(() => {
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    const predictedRevenue = screen.getByText('Predicted Revenue Score:');
    expect(predictedRevenue).toBeInTheDocument();

    const predictedRevenueValue = within(predictedRevenue).getByText('11.59');
    expect(predictedRevenueValue).toBeInTheDocument();

    const newness = screen.getByText('Days Since Launch:');
    expect(newness).toBeInTheDocument();

    const newnessValue = within(newness).getByText('100');
    expect(newnessValue).toBeInTheDocument();
  });
});
