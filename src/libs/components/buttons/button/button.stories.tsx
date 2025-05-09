import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    isPrimary: {
      control: {
        type: 'boolean',
      },
    },
    isTertiary: {
      control: {
        type: 'boolean',
      },
    },
    isDisabled: {
      control: {
        type: 'boolean',
      },
    },
    as: {
      control: {
        type: 'select',
        options: ['button', 'a'],
      },
    },
    href: {
      control: {
        type: 'text',
      },
    },
    isInline: {
      control: {
        type: 'boolean',
      },
    },
    theme: {
      control: {
        type: 'select',
        options: ['primary', 'secondary', 'tertiary'],
      },
    },
    type: {
      control: {
        type: 'select',
        options: ['submit', 'reset', 'button'],
      },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    isPrimary: true,
    isTertiary: false,
    isDisabled: false,
    theme: 'primary',
    as: 'button',
    href: undefined,
    isInline: false,
    children: 'Primary Button',
    onClick: fn(),
  },
  render: (args) => <Button {...args}>{args.children}</Button>,
};

export const Tertiary: Story = {
  args: {
    ...Primary.args,
    isPrimary: false,
    isTertiary: true,
    theme: 'tertiary',
    children: 'Tertiary Button',
  },
  render: (args) => <Button {...args}>{args.children}</Button>,
};

export const Link: Story = {
  args: {
    as: 'a',
    href: 'https://www.example.com',
    isPrimary: false,
    isTertiary: false,
    isDisabled: false,
    theme: 'primary',
    isInline: false,
    children: 'Link Button',
    onClick: fn(),
  },
  render: (args) => <Button {...args}>{args.children}</Button>,
};
