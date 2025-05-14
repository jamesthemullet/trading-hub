import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label content for checkbox',
    },
    showLabel: {
      control: 'boolean',
      description: 'Controls whether the label is visible',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the checkbox input',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Checkbox Label',
    showLabel: true,
    disabled: false,
    onChange: fn(),
  },
};
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
export const HiddenLabel: Story = {
  args: {
    ...Default.args,
    showLabel: false,
  },
};
