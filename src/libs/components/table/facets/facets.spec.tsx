import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetsManagementTable } from './facets';

const mockMerchangdisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
};
const mockRuleSets = [
  {
    categoryName: 'categoryName',
    categoryId: 'categoryId',
    id: 'id',
    isEnabled: true,
    lastChanged: {
      user: 'user',
      date: '2021-01-01',
    },
    rules: mockMerchangdisingRules,
    facets: [],
  },
];

describe('Rule Set Facets', () => {
  it('should render list of ruleset facets', () => {
    render(
      <FacetsManagementTable
        ruleSets={mockRuleSets}
        onEnableDisableRuleSet={jest.fn()}
      />
    );

    expect(screen.getByText('categoryId | categoryName')).toBeInTheDocument();
  });

  it('should enable and disable rule set', async () => {
    const mockEnableDisable = jest.fn();
    const user = userEvent.setup();

    render(
      <FacetsManagementTable
        ruleSets={mockRuleSets}
        onEnableDisableRuleSet={mockEnableDisable}
      />
    );

    await user.click(screen.getAllByTitle('Toggle')[0]);

    expect(mockEnableDisable).toHaveBeenCalledWith({
      categoryId: mockRuleSets[0].categoryId,
      isEnabled: false,
      facets: [],
      merchandisingRules: mockRuleSets[0].rules,
      ruleSetId: mockRuleSets[0].id,
    });
  });
});
