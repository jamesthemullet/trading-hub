import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { RadioButtons } from './radio-buttons';

const meta: Meta<typeof RadioButtons> = {
  title: 'Components/Radio Group',
  component: RadioButtons,
  tags: ['autodocs'],
  argTypes: {
    hasDivider: {
      control: {
        type: 'boolean',
      },
    },
    isBold: {
      control: {
        type: 'boolean',
      },
    },
    values: {
      control: {
        type: 'object',
      },
    },
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof RadioButtons>;

export const Default: Story = {
  args: {
    hasDivider: false,
    isBold: false,
    values: [
      { name: 'Option 1', isSelected: true },
      { name: 'Option 2', isSelected: false },
      { name: 'Option 3', isSelected: false },
      { name: 'Option 4', isSelected: false },
      { name: 'Option 5', isSelected: false },
    ],
    onSelect: fn(),
  },
};
export const WithDivider: Story = {
  args: {
    ...Default.args,
    hasDivider: true,
  },
};
export const Bold: Story = {
  args: {
    ...Default.args,
    isBold: true,
  },
};
