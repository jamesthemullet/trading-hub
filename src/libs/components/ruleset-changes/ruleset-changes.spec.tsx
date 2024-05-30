import { render, screen } from '@testing-library/react';

import { mockMerchandisingRulesWithInfo } from '@/test/data/mock-merchandising-rules-with-info';

import { RulesetChanges } from './ruleset-changes';

jest.mock('../../hooks/use-category-preview', () => ({
  useCategoryPreview: jest.fn(),
}));

describe('RulesetChanges', () => {
  it('should render correctly', () => {
    const { container } = render(
      <RulesetChanges
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should show pinned products', () => {
    render(
      <RulesetChanges
        merchandisingRulesWithInfo={mockMerchandisingRulesWithInfo}
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    expect(screen.getByText('ID: 60290408')).toBeInTheDocument();
  });
});
