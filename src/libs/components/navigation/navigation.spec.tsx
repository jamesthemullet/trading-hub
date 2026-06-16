import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

import { Navigation } from './navigation';

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn(),
}));

describe('Navigation', () => {
  beforeEach(() => {
    jest.mocked(usePathname).mockReturnValue('/category');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render trading hub navigation', () => {
    renderWithProviders(<Navigation />);

    expect(screen.getByTitle('Category Rules')).toBeInTheDocument();
  });

  it('should not show login button when auto login enabled', () => {
    renderWithProviders(<Navigation />);

    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('should show Sign in when signed out', () => {
    renderWithProviders(<Navigation />);

    expect(screen.getByText('Sign in')).toBeVisible();
  });

  it('should call auth Sign in when signed out', async () => {
    renderWithProviders(<Navigation />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Sign in'));

    expect(signIn).toHaveBeenCalled();
  });

  it('should show Login when authenticated', () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        accessTokenExpires: 123,
        expires: '',
        roles: ['admin'],
      },
      status: 'authenticated',
      update: jest.fn(),
    });
    renderWithProviders(<Navigation />);

    expect(screen.getByText('Sign out')).toBeVisible();
  });

  it('should call auth logout when signed in', async () => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'userId',
          email: '',
        },
        accessTokenExpires: 123,
        expires: '',
        roles: ['admin'],
      },
      status: 'authenticated',
      update: jest.fn(),
    });
    renderWithProviders(<Navigation />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Sign out'));

    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: '/api/auth/azure-logout',
    });
  });

  it('should always show Product Status nav item', () => {
    renderWithProviders(<Navigation />);
    expect(screen.getByTitle('Product Status')).toBeInTheDocument();
  });

  it('should not show Profile link when flag is off', () => {
    renderWithProviders(<Navigation />);

    expect(
      screen.queryByRole('link', { name: 'Profile' })
    ).not.toBeInTheDocument();
  });

  it('should show Profile link with icon when flag is on', () => {
    renderWithProviders(<Navigation />, [], {
      featureFlags: { hasProfilePage: true },
    });

    const link = screen.getByRole('link', { name: 'Profile' });
    expect(link).toBeInTheDocument();
    expect(link.querySelector('img')).toHaveAttribute(
      'src',
      '/trading-hub/asset/menu-profile.svg'
    );
    expect(link).toHaveAttribute('data-is-active', 'false');
  });

  it('should show Profile link as active when on /profile', () => {
    jest.mocked(usePathname).mockReturnValue('/profile');
    renderWithProviders(<Navigation />, [], {
      featureFlags: { hasProfilePage: true },
    });

    const link = screen.getByRole('link', { name: 'Profile' });
    expect(link).toHaveAttribute('data-is-active', 'true');
    expect(link.querySelector('img')).toHaveAttribute(
      'src',
      '/trading-hub/asset/menu-profile-active.svg'
    );
  });

  it.each([
    [
      '/category',
      '/trading-hub/asset/menu-category-ranking-v2-active.svg',
      '/trading-hub/asset/menu-search-v2.svg',
      '/trading-hub/asset/menu-redirect-arrow.svg',
      '/trading-hub/asset/menu-globe.svg',
    ],
    [
      '/search',
      '/trading-hub/asset/menu-category-ranking-v2.svg',
      '/trading-hub/asset/menu-search-v2-active.svg',
      '/trading-hub/asset/menu-redirect-arrow.svg',
      '/trading-hub/asset/menu-globe.svg',
    ],
    [
      '/search/redirects',
      '/trading-hub/asset/menu-category-ranking-v2.svg',
      '/trading-hub/asset/menu-search-v2.svg',
      '/trading-hub/asset/menu-redirect-arrow-active.svg',
      '/trading-hub/asset/menu-globe.svg',
    ],
    [
      '/global',
      '/trading-hub/asset/menu-category-ranking-v2.svg',
      '/trading-hub/asset/menu-search-v2.svg',
      '/trading-hub/asset/menu-redirect-arrow.svg',
      '/trading-hub/asset/menu-globe-active.svg',
    ],
  ])(
    'should activate the category menu icon',
    async (url, icon1, icon2, icon3, icon4) => {
      jest.mocked(usePathname).mockReturnValue(url);

      renderWithProviders(<Navigation />);

      expect(
        (await screen.findByRole('link', { name: 'Categories' })).childNodes[0]
      ).toHaveAttribute('src', icon1);

      expect(
        (await screen.findByRole('link', { name: 'Search' })).childNodes[0]
      ).toHaveAttribute('src', icon2);

      expect(
        (await screen.findByRole('link', { name: 'Redirect' })).childNodes[0]
      ).toHaveAttribute('src', icon3);

      expect(
        (await screen.findByRole('link', { name: 'Global' })).childNodes[0]
      ).toHaveAttribute('src', icon4);
    }
  );
});
