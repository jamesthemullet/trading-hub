import { act, render, screen, waitFor, within } from '@testing-library/react';

import type { MerchandisingRules } from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks/use-category-product-search';
import {
  mockMerchandisingRules,
  mockMerchandisingRulesWithData,
} from '@/test/data/mock-merchandising-rules';
import { renderWithProviders } from '@/test/render-with-providers';

import type { RulesetChangesProps } from './ruleset-changes';
import { RulesetChanges } from './ruleset-changes';

jest.mock('@/libs/hooks/use-preview', () => ({
  usePreview: jest.fn(),
}));
jest.mock('@/libs/hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));

const defaultProps: RulesetChangesProps = {
  isPinnable: false,
  merchandisingRules: mockMerchandisingRules,
  dispatch: jest.fn(),
  selectedProducts: [],
  onSelectAll: jest.fn(),
  onSelectProduct: jest.fn(),
  isSelectionDisabled: false,
};

describe('RulesetChanges', () => {
  it('should render correctly', () => {
    const { container } = render(<RulesetChanges {...defaultProps} />);

    expect(container.children[0]).toBeEmptyDOMElement();
  });

  it('should render with undefined data', () => {
    const undefinedMerchandisingRules: MerchandisingRules = {
      pinnedProducts: [],
      blockedProducts: [],
      boosts: { alphanumeric: [], numeric: [], product: [] },
      buries: { alphanumeric: [], numeric: [], product: [] },
      excludes: {},
      includes: {},
    };

    const { container } = render(
      <RulesetChanges
        {...defaultProps}
        merchandisingRules={undefinedMerchandisingRules}
      />
    );

    expect(container.children[0]).toBeEmptyDOMElement();
  });

  it('should show pinned products', async () => {
    jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
      error: '',
      isLoading: false,
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: '60183702',
              productId: '60183702',
              title: 'Product Title',
              imageUrl: ['example1.jpg'],
              brand: 'Product Brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£1',
              url: '',
            },
          ],
          pagination: {
            totalItems: 1,
          },
        });
      }),
    }));

    renderWithProviders(
      <RulesetChanges
        {...defaultProps}
        isPinnable
        merchandisingRules={{
          ...mockMerchandisingRulesWithData,
          pinnedProducts: [
            {
              id: '60183702',
            },
            {
              id: '60290408',
            },
            {
              id: '60169259',
            },
            {
              id: '60169250',
            },
            {
              id: '60169251',
            },
            {
              id: '60169252',
            },
          ],
          boosts: {
            ...mockMerchandisingRulesWithData.boosts,
            product: [{ id: '3523522', weight: 100 }],
          },
          buries: {
            ...mockMerchandisingRulesWithData.buries,
            product: [{ id: '3523522', weight: 100 }],
          },
          blockedProducts: [{ id: '124124' }],
        }}
      />
    );

    const attributeTitle = await screen.findByText(
      'Attribute-level changes (4)'
    );
    const shownProduct = await screen.findByText('Product Brand Product Title');
    const errorProduct = await screen.findByText('Product 60290408 not found');

    expect(attributeTitle).toBeVisible();
    expect(shownProduct).toBeVisible();
    expect(errorProduct).toBeVisible();
  });

  it('should show attribute changes', async () => {
    jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
      error: '',
      isLoading: false,
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: '60183702',
              productId: '60183702',
              title: 'Product Title',
              imageUrl: ['example1.jpg'],
              brand: 'Product Brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£1',
              url: '',
            },
          ],
          pagination: {
            totalItems: 1,
          },
        });
      }),
    }));

    renderWithProviders(
      <RulesetChanges
        {...defaultProps}
        isPinnable
        merchandisingRules={{
          ...mockMerchandisingRules,
          boosts: {
            product: [],
            numeric: [
              {
                field: 'field1',
                weight: 100,
              },
            ],
            alphanumeric: [
              {
                fields: [
                  {
                    field: 'field2',
                    values: ['Thermals'],
                  },
                ],
                weight: 100,
              },
            ],
          },
          buries: {
            product: [],
            numeric: [
              {
                field: 'field3',
                weight: 100,
              },
            ],
            alphanumeric: [
              {
                fields: [
                  {
                    field: 'field4',
                    values: ['Socks'],
                  },
                ],
                weight: 100,
              },
            ],
          },
          includes: {
            alphanumeric: [
              {
                fields: [
                  {
                    field: 'field5',
                    values: ['Sandles'],
                  },
                ],
              },
            ],
          },
          excludes: {
            alphanumeric: [
              {
                fields: [
                  {
                    field: 'field6',
                    values: ['Dresses'],
                  },
                ],
              },
            ],
          },
        }}
        dispatch={jest.fn()}
      />
    );

    const attributeTitle = await screen.findByText(
      'Attribute-level changes (6)'
    );

    expect(attributeTitle).toBeInTheDocument();
  });

  it('should show loader for products', async () => {
    jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
      error: '',
      isLoading: true,
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: '60183702',
              productId: '60183702',
              title: 'Product Title',
              imageUrl: ['example1.jpg'],
              brand: 'Product Brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£1',
              url: '',
            },
          ],
          pagination: {
            totalItems: 1,
          },
        });
      }),
    }));

    renderWithProviders(
      <RulesetChanges
        {...defaultProps}
        isPinnable
        merchandisingRules={{
          ...mockMerchandisingRulesWithData,
          pinnedProducts: [
            {
              id: '60183702',
            },
            {
              id: '60169259',
            },
            {
              id: '60169250',
            },
            {
              id: '60169251',
            },
            {
              id: '60169252',
            },
          ],
          boosts: {
            ...mockMerchandisingRulesWithData.boosts,
            product: [{ id: '3523522', weight: 100 }],
          },
          buries: {
            ...mockMerchandisingRulesWithData.buries,
            product: [{ id: '3523522', weight: 100 }],
          },
          blockedProducts: [{ id: '124124' }],
        }}
      />
    );

    const attributeTitle = await screen.findByText(
      'Attribute-level changes (4)'
    );
    const productLoader = await screen.findAllByTestId('Product loader');

    expect(attributeTitle).toBeInTheDocument();
    expect(productLoader).toHaveLength(8);
  });

  it('should show load more button', async () => {
    jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
      error: '',
      isLoading: false,
      searchForProduct: jest.fn(() => {
        return Promise.resolve({
          products: Array.from({ length: 9 }).map((_, index) => ({
            id: `6018370${index}`,
            productId: `6018370${index}`,
            title: 'Product Title',
            imageUrl: ['example1.jpg'],
            brand: 'Product Brand',
            metadata: { isPinned: false },
            isInStock: true,
            price: '£1',
            url: '',
          })),
          pagination: {
            totalItems: 9,
          },
        });
      }),
    }));

    renderWithProviders(
      <RulesetChanges
        {...defaultProps}
        isPinnable
        merchandisingRules={{
          ...mockMerchandisingRulesWithData,
          pinnedProducts: Array.from({ length: 9 }).map((_, index) => ({
            id: `6018370${index}`,
          })),
          boosts: {
            ...mockMerchandisingRulesWithData.boosts,
            product: [{ id: '3523522', weight: 100 }],
          },
          buries: {
            ...mockMerchandisingRulesWithData.buries,
            product: [{ id: '3523522', weight: 100 }],
          },
          blockedProducts: [{ id: '124124' }],
        }}
      />
    );

    const loadMoreButton = await screen.findByText('Load more products');

    expect(loadMoreButton).toBeInTheDocument();

    await act(async () => {
      loadMoreButton.click();
    });

    const pinnedProducts = screen.getByTestId('Pinned Products');
    const product9 = await waitFor(() =>
      within(pinnedProducts).getByTestId('Position 9')
    );

    expect(product9).toBeInTheDocument();

    await act(async () => {
      loadMoreButton.click();
    });

    expect(
      within(pinnedProducts).queryByTestId('Position 10')
    ).not.toBeInTheDocument();
  });

  describe('Bulk actions', () => {
    afterAll(() => {
      jest.resetAllMocks();
    });

    it('Should select all products', async () => {
      const mockSelectAll = jest.fn();

      jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
        error: '',
        isLoading: false,
        searchForProduct: jest.fn(() => {
          return Promise.resolve({
            products: [
              {
                id: '60183702',
                productId: '60183702',
                title: 'Product Title',
                imageUrl: ['example1.jpg'],
                brand: 'Product Brand',
                metadata: { isPinned: false },
                isInStock: true,
                price: '£1',
                url: '',
              },
            ],
            pagination: {
              totalItems: 1,
            },
          });
        }),
      }));

      renderWithProviders(
        <RulesetChanges
          {...defaultProps}
          isPinnable
          onSelectAll={mockSelectAll}
          merchandisingRules={{
            includes: {},
            excludes: {},
            blockedProducts: [{ id: '60183702' }],
            pinnedProducts: [
              {
                id: '60183703',
              },
            ],
            boosts: {
              numeric: [],
              alphanumeric: [],
              product: [{ id: '60183704', weight: 100 }],
            },
            buries: {
              numeric: [],
              alphanumeric: [],
              product: [{ id: '60183705', weight: 100 }],
            },
          }}
        />
      );

      const blockProductsTitle = await screen.findByText(
        'Blocked Products (1)'
      );

      expect(blockProductsTitle).toBeInTheDocument();

      const selectAll = await screen.findAllByLabelText('Select all');

      await act(async () => {
        selectAll[0].click();
      });

      expect(mockSelectAll).toHaveBeenCalledWith(['60183702']);
    });

    it('Should deselect all products', async () => {
      const mockSelectAll = jest.fn();

      jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
        error: '',
        isLoading: false,
        searchForProduct: jest.fn(() => {
          return Promise.resolve({
            products: [
              {
                id: '60183701',
                productId: '60183701',
                title: 'Product Title 1',
                imageUrl: ['example1.jpg'],
                brand: 'Product Brand',
                metadata: { isPinned: false },
                isInStock: true,
                price: '£1',
                url: '',
              },
              {
                id: '60183702',
                productId: '60183702',
                title: 'Product Title 2',
                imageUrl: ['example1.jpg'],
                brand: 'Product Brand',
                metadata: { isPinned: false },
                isInStock: true,
                price: '£1',
                url: '',
              },
              {
                id: '60183703',
                productId: '60183703',
                title: 'Product Title 3',
                imageUrl: ['example1.jpg'],
                brand: 'Product Brand',
                metadata: { isPinned: false },
                isInStock: true,
                price: '£1',
                url: '',
              },
            ],
            pagination: {
              totalItems: 1,
            },
          });
        }),
      }));

      renderWithProviders(
        <RulesetChanges
          {...defaultProps}
          isPinnable
          onSelectAll={mockSelectAll}
          selectedProducts={['60183701', '60183702']}
          merchandisingRules={{
            includes: {},
            excludes: {},
            blockedProducts: [{ id: '60183701' }, { id: '60183702' }],
            pinnedProducts: [
              {
                id: '60183703',
              },
            ],
            boosts: {
              numeric: [],
              alphanumeric: [],
              product: [],
            },
            buries: {
              numeric: [],
              alphanumeric: [],
              product: [],
            },
          }}
        />
      );

      const blockProductsTitle = await screen.findByRole('heading', {
        name: 'Blocked Products (2)',
      });

      expect(blockProductsTitle).toBeVisible();

      const selectAll = await screen.findAllByLabelText('Select all');

      await act(async () => {
        selectAll[0].click();
      });

      expect(mockSelectAll).toHaveBeenLastCalledWith([]);
    });

    it('Should not allow selecting pinned products if blocked products selected', async () => {
      const mockSelectAll = jest.fn();

      const mockBlockedProduct = {
        id: '60183702',
        productId: '60183702',
        title: 'Product Blocked Title',
        imageUrl: ['example1.jpg'],
        brand: 'Product Brand',
        metadata: { isPinned: false },
        isInStock: true,
        price: '£1',
        url: '',
      };

      const mockPinnedProduct = {
        id: '60183703',
        productId: '60183703',
        title: 'Product Pinned Title',
        imageUrl: ['example1.jpg'],
        brand: 'Product Brand',
        metadata: { isPinned: false },
        isInStock: true,
        price: '£1',
        url: '',
      };

      jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
        error: '',
        isLoading: false,
        searchForProduct: jest.fn((args) => {
          const productToReturn =
            args?.productIds?.[0] === '60183702'
              ? mockBlockedProduct
              : mockPinnedProduct;

          return Promise.resolve({
            products: [productToReturn],
            pagination: {
              totalItems: 1,
            },
          });
        }),
      }));

      renderWithProviders(
        <RulesetChanges
          {...defaultProps}
          isPinnable
          onSelectAll={mockSelectAll}
          selectedProducts={['60183702']}
          merchandisingRules={{
            includes: {},
            excludes: {},
            blockedProducts: [{ id: '60183702' }],
            pinnedProducts: [
              {
                id: '60183703',
              },
            ],
            boosts: {
              numeric: [],
              alphanumeric: [],
              product: [],
            },
            buries: {
              numeric: [],
              alphanumeric: [],
              product: [],
            },
          }}
        />
      );

      const blockProductsTitle = screen.getByRole('heading', {
        name: 'Blocked Products (1)',
      });

      expect(blockProductsTitle).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Product Pinned Title')
        ).toBeDisabled();
      });
    });
  });
});
