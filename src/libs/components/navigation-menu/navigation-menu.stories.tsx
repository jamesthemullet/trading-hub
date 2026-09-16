import type { ReactElement } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NavigationMenu } from './navigation-menu';

const meta: Meta<typeof NavigationMenu> = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/category',
      },
    },
  },
  decorators: [
    (Story: () => ReactElement): ReactElement => (
      <div style={{ width: '100px', backgroundColor: '#1D1D1B' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

const menuItems = [
  {
    title: 'Category Rules',
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
    path: '/search/redirects',
    icon: '/trading-hub/asset/menu-redirect-arrow.svg',
    activeIcon: '/trading-hub/asset/menu-redirect-arrow-active.svg',
    alt: 'Redirect Rules',
    shortTitle: 'Redirect',
  },
  {
    title: 'Global Ranking Rules',
    path: '/global',
    icon: '/trading-hub/asset/menu-globe.svg',
    activeIcon: '/trading-hub/asset/menu-globe-active.svg',
    alt: 'Global Ranking Rules',
    shortTitle: 'Global',
  },
];

export const Default: Story = {
  args: {
    menuItems,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/category',
      },
    },
  },
};

export const SearchActive: Story = {
  args: {
    menuItems,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/search',
      },
    },
  },
};

export const RedirectActive: Story = {
  args: {
    menuItems,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/search/redirects',
      },
    },
  },
};

export const GlobalActive: Story = {
  args: {
    menuItems,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/global',
      },
    },
  },
};
