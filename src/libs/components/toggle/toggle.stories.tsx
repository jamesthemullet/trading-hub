import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Toggle } from './toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the toggle interaction',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    checked: true,
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
