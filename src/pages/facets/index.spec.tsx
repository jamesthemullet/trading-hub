import { render, screen } from '@testing-library/react';

import { useRuleSet } from '@/libs/hooks';

import { default as FacetManagementPage } from './index.page';

jest.mock('../../libs/hooks/use-rule-set', () => ({
  useRuleSet: jest.fn(),
}));

const mockMerchangdisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
};

describe('Category facet management', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays the list of rules', () => {
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoryId: `${i}`,
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: mockMerchangdisingRules,
        setRuleSets: jest.fn(),
        facets: [],
      })),
      pagination: {
        totalItems: 80,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    render(<FacetManagementPage />);

    expect(screen.getByText('Category Facet Management')).toBeVisible();
    expect(screen.getByText('Add facet')).toBeVisible();
    expect(screen.getByText('1 | identifier-1')).toBeVisible();
  });
});
