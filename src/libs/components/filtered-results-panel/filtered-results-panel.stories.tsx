import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { FilteredResultsPanel } from './filtered-results-panel';

const meta: Meta<typeof FilteredResultsPanel> = {
  title: 'Components/FilteredResultsPanel',
  component: FilteredResultsPanel,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    filteredFacets: {
      control: 'number',
      description: 'Number of filtered results',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilteredResultsPanel>;

export const Default: Story = {
  args: {
    filteredFacets: 42,
  },
};

export const SingleResult: Story = {
  args: {
    filteredFacets: 1,
  },
};

export const NoResults: Story = {
  args: {
    filteredFacets: 0,
  },
};

export const ManyResults: Story = {
  args: {
    filteredFacets: 1234,
  },
};
