import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('should render the label', () => {
    renderWithProviders(
      <StatusBadge variant="operational" label="Operational" />
    );
    expect(screen.getByText('Operational')).toBeVisible();
  });

  it('should set data-variant attribute', () => {
    renderWithProviders(
      <StatusBadge variant="issue-detected" label="Issue detected" />
    );
    expect(
      screen
        .getByText('Issue detected')
        .closest('[data-variant="issue-detected"]')
    ).toBeInTheDocument();
  });

  it('should render the correct icon alt text for blocked variant', () => {
    renderWithProviders(
      <StatusBadge variant="blocked" label="Blocked by an issue" />
    );
    expect(screen.getByAltText('Blocked by an issue')).toBeInTheDocument();
  });

  it('should render the correct icon alt text for product-operational variant', () => {
    renderWithProviders(
      <StatusBadge
        variant="product-operational"
        label="Product is operational"
      />
    );
    expect(screen.getByAltText('Product is operational')).toBeInTheDocument();
  });
});
