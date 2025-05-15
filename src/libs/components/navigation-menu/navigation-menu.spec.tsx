import { render, screen } from '@testing-library/react';

import { usePathname } from 'next/navigation';

import { NavigationMenu } from './navigation-menu';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn(),
}));

const menuItems = [
  {
    title: 'Category Ranking Rules',
    path: '/category',
    icon: '/trading-hub/asset/menu-category-ranking-v2.svg',
    activeIcon: '/trading-hub/asset/menu-category-ranking-v2-active.svg',
    alt: 'Category Ranking Rules',
    shortTitle: 'Categories',
  },
  {
    title: 'Search Ranking Rules',
    path: '/search',
    pathExcludes: 'redirects',
    icon: '/trading-hub/asset/menu-search-v2.svg',
    activeIcon: '/trading-hub/asset/menu-search-v2-active.svg',
    alt: 'Search Ranking Rules',
    shortTitle: 'Search',
  },
  {
    title: 'Redirect Rules',
    path: '/redirect',
    icon: '/trading-hub/asset/menu-redirect-arrow.svg',
    activeIcon: '/trading-hub/asset/menu-redirect-arrow-active.svg',
    alt: 'Redirect Rules',
    shortTitle: 'Redirect',
  },
  {
    title: 'Global',
    path: '/global',
    icon: '/trading-hub/asset/menu-globe.svg',
    activeIcon: '/trading-hub/asset/menu-globe-active.svg',
    alt: 'Global',
    shortTitle: 'Global',
  },
];

describe('NavigationMenu', () => {
  beforeEach(() => {
    jest.mocked(usePathname).mockReturnValue('/category/rulesets');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render trading hub navigation', () => {
    render(<NavigationMenu menuItems={menuItems} />);

    expect(screen.getByTitle('Category Ranking Rules')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Global' })).toHaveAttribute(
      'href',
      '/global'
    );
  });
});
