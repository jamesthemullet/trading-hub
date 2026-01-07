import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Tabs } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const TabsWithState = (args: { tabs: { title: string; count?: number }[] }) => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Tabs
      tabs={args.tabs}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
    />
  );
};

export const ThreeTabs: Story = {
  args: {
    tabs: [{ title: 'Overview' }, { title: 'Details' }, { title: 'Settings' }],
    currentTab: 0,
    onTabChange: fn(),
  },
  render: (args) => <TabsWithState tabs={args.tabs} />,
};

export const WithCounts: Story = {
  args: {
    tabs: [
      { title: 'Active', count: 12 },
      { title: 'Pending', count: 5 },
    ],
    currentTab: 0,
    onTabChange: fn(),
  },
  render: (args) => <TabsWithState tabs={args.tabs} />,
};
