import { act, render, screen } from '@testing-library/react';

import { usePathname } from 'next/navigation';

import { NavigationMenu } from './navigation-menu';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn(),
}));

const menuItems = [
  {
    title: 'Category Ranking Rules',
    path: '/category/',
    icon: '/trading-hub/asset/menu-category-ranking-v2.svg',
    activeIcon: '/trading-hub/asset/menu-category-ranking-v2-active.svg',
    subLinks: [
      { href: '/category/rulesets', text: 'Ranking rules' },
      { href: '/category/facets', text: 'Facets' },
    ],
    alt: 'Category Ranking Rules',
    shortTitle: 'Categories',
  },
  {
    title: 'Search Ranking Rules',
    path: '/search/',
    icon: '/trading-hub/asset/menu-search-v2.svg',
    activeIcon: '/trading-hub/asset/menu-search-v2-active.svg',
    subLinks: [
      { href: '/search/rulesets', text: 'Ranking rules' },
      { href: '/search/facets', text: 'Facets' },
    ],
    alt: 'Search Ranking Rules',
    shortTitle: 'Search',
  },
  {
    title: 'Redirect Rules',
    path: '/redirect',
    icon: '/trading-hub/asset/menu-redirect-arrow.svg',
    activeIcon: '/trading-hub/asset/menu-redirect-arrow-active.svg',
    subLinks: [{ href: '/redirects', text: 'Redirect rules' }],
    alt: 'Redirect Rules',
    shortTitle: 'Redirect',
  },
  {
    title: 'Setup',
    path: '/global/',
    icon: '/trading-hub/asset/menu-globe.svg',
    activeIcon: '/trading-hub/asset/menu-globe-active.svg',
    subLinks: [
      { href: '/global/rulesets', text: 'Global Category Ranking' },
      { href: '/global/facets', text: 'Global Facet Management' },
    ],
    alt: 'Setup',
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
  });

  it('should open and close category sub menu', () => {
    render(<NavigationMenu menuItems={menuItems} />);

    const menuItemOne = screen.getByRole('button', {
      name: 'Category Ranking Rules',
    });

    act(() => {
      menuItemOne.click();
    });

    expect(screen.getByRole('link', { name: 'Ranking rules' })).toBeVisible();

    act(() => {
      menuItemOne.click();
    });

    expect(
      screen.queryByRole('link', { name: 'Ranking rules' })
    ).not.toBeInTheDocument();
  });

  it.each([
    ['Category Ranking Rules', ['Ranking rules', 'Facets'], 'Category Ranking'],
    [
      'Search Ranking Rules',
      ['Ranking rules', 'Facets'],
      'Search optimisation',
    ],
    ['Redirect Rules', ['Redirect rules'], 'Redirects'],
    [
      'Setup',
      ['Global Category Ranking', 'Global Facet Management'],
      'Setup Global',
    ],
  ])(
    'should close the submenu on navigation via sublink',
    (menuItemName, subLinkNames, hiddenText) => {
      render(<NavigationMenu menuItems={menuItems} />);
      const menuItem = screen.getByRole('button', { name: menuItemName });

      act(() => {
        menuItem.click();
      });

      subLinkNames.forEach((subLinkName) => {
        const subLink = screen.getByRole('link', { name: subLinkName });

        act(() => {
          subLink.click();
        });

        expect(screen.queryByText(hiddenText)).not.toBeInTheDocument();

        act(() => {
          menuItem.click();
        });
      });
    }
  );
});
