import { render, screen } from '@testing-library/react';

import { RulesetChanges } from './ruleset-changes';

describe('RulesetChanges', () => {
  it('should render correctly', () => {
    render(
      <RulesetChanges
        merchandisingRules={{
          pinnedProducts: [],
          blockedProducts: [],
          boosts: { numeric: [], alphaNumeric: [], product: [] },
          buries: { numeric: [], alphaNumeric: [], product: [] },
        }}
        onChangePosition={jest.fn()}
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
          boosts: { numeric: [], alphaNumeric: [], product: [] },
          buries: { numeric: [], alphaNumeric: [], product: [] },
        }}
        onChangePosition={jest.fn()}
      />
    );

    expect(screen.getByText('ID: abc')).toBeInTheDocument();
  });
});
