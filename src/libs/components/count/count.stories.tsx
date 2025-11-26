import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Count } from './count';

const meta: Meta<typeof Count> = {
  title: 'Components/Count',
  component: Count,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Count>;

export const Default: Story = {
  args: {
    children: '5',
  },
};

export const LargeNumber: Story = {
  args: {
    children: '99+',
  },
};

export const SingleDigit: Story = {
  args: {
    children: '1',
  },
};
