import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetsPanelAccordion } from './facets-panel-accordion';

describe('FacetsPanelAccordion', () => {
  it('renders toggle button and summary counts', async () => {
    const user = userEvent.setup();
    render(
      <FacetsPanelAccordion
        boostedCount={2}
        excludedCount={3}
        nonBoostedExcludedCount={4}
      />
    );

    expect(
      screen.getByRole('button', { name: 'View Summary' })
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('attribute-summary-label')
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));
    expect(
      screen.getByRole('button', { name: 'Hide Summary' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('attribute-summary-label')).toBeInTheDocument();
    expect(screen.getByTestId('include-only-count')).toHaveTextContent('2');
    expect(screen.getByTestId('exclude-only-count')).toHaveTextContent('3');
    expect(screen.getByTestId('algo-control-count')).toHaveTextContent('4');

    await user.click(screen.getByRole('button'));
    expect(
      screen.getByRole('button', { name: 'View Summary' })
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('attribute-summary-label')
    ).not.toBeInTheDocument();
  });
});
