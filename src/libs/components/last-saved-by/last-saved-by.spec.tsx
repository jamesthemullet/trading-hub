import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { LastSavedBy } from './last-saved-by';

describe('LastSavedBy', () => {
  it('should not render when lastChanged is not provided', () => {
    renderWithProviders(<LastSavedBy />);

    expect(screen.queryByText(/Last saved by/)).not.toBeInTheDocument();
  });

  it('should render last saved info when lastChanged is provided', () => {
    renderWithProviders(
      <LastSavedBy
        lastChanged={{ date: '2024-01-01T12:30:00Z', user: 'test-user' }}
      />
    );

    expect(screen.getByText(/Last saved by:/)).toBeVisible();
    expect(screen.getByText('test-user')).toBeVisible();
    expect(screen.getByText(/Jan 1, 2024/)).toBeVisible();
  });

  it('should not render when lastChanged has an invalid date', () => {
    renderWithProviders(
      <LastSavedBy lastChanged={{ date: 'not-a-date', user: 'test-user' }} />
    );

    expect(screen.queryByText(/Last saved by/)).not.toBeInTheDocument();
  });

  it('should not render when lastChanged has no user', () => {
    renderWithProviders(
      <LastSavedBy lastChanged={{ date: '2024-01-01T12:30:00Z', user: '' }} />
    );

    expect(screen.queryByText(/Last saved by/)).not.toBeInTheDocument();
  });
});
