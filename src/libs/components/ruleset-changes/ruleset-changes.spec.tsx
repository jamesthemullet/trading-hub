import { act, render, screen, waitFor, within } from '@testing-library/react';

import {
  mockMerchandisingRules,
  mockMerchandisingRulesWithData,
} from '@/test/data/mock-merchandising-rules';
import { renderWithProviders } from '@/test/render-with-providers';

import { useCategoryProductSearch } from '../../hooks/use-category-product-search';
import { RulesetChanges } from './ruleset-changes';

jest.mock('../../hooks/use-preview', () => ({
  usePreview: jest.fn(),
}));
jest.mock('../../hooks/use-category-product-search', () => ({
  useCategoryProductSearch: jest.fn(),
}));

describe('RulesetChanges', () => {
  it('should render correctly', () => {
    const { container } = render(
      <RulesetChanges
        isPinnable={false}
        merchandisingRules={mockMerchandisingRules}
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
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
        isPinnable={true}
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
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    const attributeTitle = await waitFor(() =>
      screen.getByText('Attribute-level changes (4)')
    );
    const shownProduct = await waitFor(() => screen.getByText('ID: 60183702'));
    const errorProduct = await waitFor(() =>
      screen.getByText('Product 60290408 not found')
    );

    expect(attributeTitle).toBeInTheDocument();
    expect(shownProduct).toBeInTheDocument();
    expect(errorProduct).toBeInTheDocument();
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
        isPinnable={true}
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
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    const attributeTitle = await waitFor(() =>
      screen.getByText('Attribute-level changes (6)')
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
        isPinnable={true}
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
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    const attributeTitle = await waitFor(() =>
      screen.getByText('Attribute-level changes (4)')
    );
    const productLoader = await waitFor(() =>
      screen.getAllByLabelText('Product loader')
    );

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
        isPinnable={true}
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
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    const loadMoreButton = await waitFor(() =>
      screen.getByText('Load more products')
    );

    expect(loadMoreButton).toBeInTheDocument();

    act(() => {
      loadMoreButton.click();
    });

    const pinnedProducts = screen.getByLabelText('Pinned Products');
    const product9 = await waitFor(() =>
      within(pinnedProducts).getByLabelText('Position 9')
    );

    expect(product9).toBeInTheDocument();

    act(() => {
      loadMoreButton.click();
    });

    expect(
      within(pinnedProducts).queryByLabelText('Position 10')
    ).not.toBeInTheDocument();
  });
});
