import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Heading } from './heading';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  tags: ['autodocs'],
  argTypes: {
    breadcrumbs: {
      control: 'object',
      description: 'Array of breadcrumb labels to display',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    breadcrumbs: ['Search', 'Merchandising', 'Site search', 'Ranking rules'],
  },
};

export const SingleLevel: Story = {
  args: {
    breadcrumbs: ['Dashboard'],
  },
};
