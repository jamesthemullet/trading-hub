import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { InfoCard } from './info-card';

describe('InfoCard', () => {
  it('should render the title and status label', () => {
    renderWithProviders(
      <InfoCard
        title="Product data"
        statusVariant="operational"
        statusLabel="Operational"
      >
        <span />
      </InfoCard>
    );
    expect(screen.getByText('Product data')).toBeVisible();
    expect(screen.getByText('Operational')).toBeVisible();
  });

  it('should render children and apply the status variant to the badge', () => {
    renderWithProviders(
      <InfoCard
        title="Associated rules"
        statusVariant="blocked"
        statusLabel="Blocked by an issue"
      >
        <span>child content</span>
      </InfoCard>
    );
    expect(screen.getByText('child content')).toBeVisible();
    expect(
      screen
        .getByText('Blocked by an issue')
        .closest('[data-variant="blocked"]')
    ).toBeInTheDocument();
  });
});
