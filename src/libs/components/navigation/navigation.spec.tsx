import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    jest.mocked(usePathname).mockReturnValue('/category/rulesets');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render trading hub navigation', () => {
    render(<Navigation />);

    expect(screen.getByTitle('Category Ranking Rules')).toBeInTheDocument();
  });

  it('should open and close category sub menu', () => {
    render(<Navigation />);

    const menuItemOne = screen.getByRole('button', {
      name: 'Category Ranking Rules',
    });

    act(() => {
      menuItemOne.click();
    });

    expect(screen.getByText('Category Ranking')).toBeVisible();

    act(() => {
      menuItemOne.click();
    });

    expect(screen.getByText('Category Ranking')).not.toBeVisible();
  });

  it('should open and close search sub menu', () => {
    render(<Navigation />);

    const menuItemTwo = screen.getByRole('button', {
      name: 'Search Ranking Rules',
    });

    act(() => {
      menuItemTwo.click();
    });

    expect(screen.getByText('Search optimisation')).toBeVisible();

    act(() => {
      menuItemTwo.click();
    });

    expect(screen.getByText('Search optimisation')).not.toBeVisible();
  });

  it('should open and close setup sub menu', () => {
    render(<Navigation />);

    const menuItemThree = screen.getByRole('button', {
      name: 'Setup',
    });

    act(() => {
      menuItemThree.click();
    });

    expect(screen.getByText('Setup Global')).toBeVisible();

    act(() => {
      menuItemThree.click();
    });

    expect(screen.getByText('Setup Global')).not.toBeVisible();
  });

  it('should show Login when signed out', () => {
    render(<Navigation />);

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should call auth Login when signed out', async () => {
    render(<Navigation />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Login'));

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
      },
      status: 'authenticated',
      update: jest.fn(),
    });
    render(<Navigation />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
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
      },
      status: 'authenticated',
      update: jest.fn(),
    });
    render(<Navigation />);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('Logout'));

    expect(signOut).toHaveBeenCalled();
  });

  it.each([
    [
      '/category/rulesets',
      '/trading-hub/asset/menu-category-ranking-v2-active.svg',
      '/trading-hub/asset/menu-search-v2.svg',
      '/trading-hub/asset/menu-setup-v2.svg',
    ],
    [
      '/search/rulesets',
      '/trading-hub/asset/menu-category-ranking-v2.svg',
      '/trading-hub/asset/menu-search-v2-active.svg',
      '/trading-hub/asset/menu-setup-v2.svg',
    ],
    [
      '/global/rulesets',
      '/trading-hub/asset/menu-category-ranking-v2.svg',
      '/trading-hub/asset/menu-search-v2.svg',
      '/trading-hub/asset/menu-setup-v2-active.svg',
    ],
  ])(
    'should activate the category menu icon',
    async (url, icon1, icon2, icon3) => {
      jest.mocked(usePathname).mockReturnValue(url);

      render(<Navigation />);

      expect(
        (await screen.findByLabelText('Category Ranking Rules')).childNodes[0]
      ).toHaveAttribute('src', icon1);

      expect(
        (await screen.findByLabelText('Search Ranking Rules')).childNodes[0]
      ).toHaveAttribute('src', icon2);

      expect(
        (await screen.findByLabelText('Setup')).childNodes[0]
      ).toHaveAttribute('src', icon3);
    }
  );
});
