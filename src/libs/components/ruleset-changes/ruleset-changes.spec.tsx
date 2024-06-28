import { render, screen } from '@testing-library/react';

import {
  mockMerchandisingRules,
  mockMerchandisingRulesWithData,
} from '@/test/data/mock-merchandising-rules';
import { mockMerchandisingRulesWithInfo } from '@/test/data/mock-merchandising-rules-with-info';

import { RulesetChanges } from './ruleset-changes';

jest.mock('../../hooks/use-category-preview', () => ({
  useCategoryPreview: jest.fn(),
}));

describe('RulesetChanges', () => {
  it('should render correctly', () => {
    const { container } = render(
      <RulesetChanges
        merchandisingRules={mockMerchandisingRules}
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should show pinned products', () => {
    render(
      <RulesetChanges
        merchandisingRules={mockMerchandisingRulesWithData}
        merchandisingRulesWithInfo={mockMerchandisingRulesWithInfo}
        onChangePosition={jest.fn()}
        onProductBoostBury={jest.fn()}
      />
    );

    expect(screen.getByText('ID: 60290408')).toBeInTheDocument();
  });
});
