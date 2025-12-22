import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Pagination } from './pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    current: {
      control: {
        type: 'number',
        min: 1,
      },
      description: 'Current page number',
    },
    total: {
      control: {
        type: 'number',
        min: 1,
      },
      description: 'Total number of pages',
    },
    onClick: {
      description: 'Callback function when page navigation is clicked',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    current: 5,
    total: 10,
    onClick: fn(),
  },
};

export const FirstPage: Story = {
  args: {
    current: 1,
    total: 10,
    onClick: fn(),
  },
};

export const LastPage: Story = {
  args: {
    current: 10,
    total: 10,
    onClick: fn(),
  },
};

export const SinglePage: Story = {
  args: {
    current: 1,
    total: 1,
    onClick: fn(),
  },
};

export const MiddlePage: Story = {
  args: {
    current: 5,
    total: 20,
    onClick: fn(),
  },
};
