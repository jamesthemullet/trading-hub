import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { ReadOnlyBanner } from './read-only-banner';

describe('ReadOnlyBanner', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders the required write role and admin link', () => {
    renderWithProviders(<ReadOnlyBanner requiredWriteRole="Cat.W" />);

    expect(
      screen.getByText(/you're viewing this page in read-only mode/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/request the "Cat.W" role for write access/i, {
        exact: false,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /contact admin on our teams channel/i,
      })
    ).toHaveAttribute(
      'href',
      'https://teams.microsoft.com/l/channel/19%3A69011a4ab2784a5b8c74bc7ad61472d7%40thread.tacv2/%5BSquad%5D%20Search%20-%20General?groupId=09be67e3-2208-45f2-9eaf-41d6c22743bb&tenantId=bd5c6713-7399-4b31-be79-78f2d078e543'
    );
  });

  it('is dismissable — hides after clicking the close button', async () => {
    const user = userEvent.setup();

    renderWithProviders(<ReadOnlyBanner requiredWriteRole="Search.W" />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');

    await user.click(
      screen.getByRole('button', { name: 'Dismiss read-only notice' })
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('stays dismissed after remounting on the same section', async () => {
    const user = userEvent.setup();

    const { unmount } = renderWithProviders(
      <ReadOnlyBanner requiredWriteRole="Search.W" />
    );

    await user.click(
      screen.getByRole('button', { name: 'Dismiss read-only notice' })
    );

    unmount();

    renderWithProviders(<ReadOnlyBanner requiredWriteRole="Search.W" />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('shows again for a different section after being dismissed elsewhere', async () => {
    const user = userEvent.setup();

    const { unmount } = renderWithProviders(
      <ReadOnlyBanner requiredWriteRole="Search.W" />
    );

    await user.click(
      screen.getByRole('button', { name: 'Dismiss read-only notice' })
    );

    unmount();

    renderWithProviders(<ReadOnlyBanner requiredWriteRole="Glob.W" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
