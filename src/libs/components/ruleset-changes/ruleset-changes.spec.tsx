import { render, screen } from '@testing-library/react';

import { RulesetChanges } from './ruleset-changes';
import { useCategoryPreview } from '../../hooks';

jest.mock('../../hooks/use-category-preview', () => ({
  useCategoryPreview: jest.fn(),
}));

const mockMerchandisingRules = {
  pinnedProducts: [
    {
      id: 'abc',
      productId: 'productId',
      title: 'productTitle',
      imageUrl: ['example.jpg'],
      brand: 'productBrand',
      metadata: { isPinned: false },
      isInStock: true,
      price: 'productPrice',
      url: '',
    },
  ],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
};

describe('RulesetChanges', () => {
  beforeEach(() => {
    jest.mocked(useCategoryPreview).mockReturnValue({
      categoryProducts: [],
      categoryFacets: [],
      merchandisingRulesWithInfo: mockMerchandisingRules,
      error: '',
      setRules: jest.fn(),
    });
  });

  it('should render correctly', () => {
    render(
      <RulesetChanges
        merchandisingRules={{
          pinnedProducts: [],
          blockedProducts: [],
          boosts: {
            numeric: [
              {
                field: 'field',
                weight: 1,
              },
            ],
            alphanumeric: [
              {
                weight: 1,
                fields: [
                  {
                    field: 'field',
                    values: ['value'],
                  },
                ],
              },
            ],
            product: [
              {
                id: '1',
                weight: 1,
              },
            ],
          },
          buries: {
            numeric: [
              {
                field: 'field',
                weight: 1,
              },
            ],
            alphanumeric: [
              {
                weight: 1,
                fields: [
                  {
                    field: 'field',
                    values: ['value'],
                  },
                ],
              },
            ],
            product: [
              {
                id: '1',
                weight: 1,
              },
            ],
          },
        }}
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    expect(screen.getByText('Pinned Products (0)')).toBeInTheDocument();
  });

  it('should show pinned products', () => {
    render(
      <RulesetChanges
        merchandisingRules={{
          pinnedProducts: [{ id: 'abc' }],
          blockedProducts: [],
          boosts: { numeric: [], alphanumeric: [], product: [] },
          buries: { numeric: [], alphanumeric: [], product: [] },
        }}
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    expect(screen.getByText('ID: productId')).toBeInTheDocument();
  });
});
