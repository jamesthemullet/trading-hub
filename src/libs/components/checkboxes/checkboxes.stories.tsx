import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Checkboxes } from './checkboxes';

const meta: Meta<typeof Checkboxes> = {
  title: 'Components/Checkboxes',
  component: Checkboxes,
  argTypes: {
    values: {
      control: 'object',
      description: 'List of checkbox items with name and selection status',
    },
    onSelect: {
      action: 'onSelect',
      description: 'Handler called when a checkbox is toggled',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Checkboxes>;

export const Default: Story = {
  args: {
    values: [
      { name: 'Option 1', isSelected: false },
      { name: 'Option 2', isSelected: false },
      { name: 'Option 3', isSelected: true },
    ],
    onSelect: fn(),
  },
};
