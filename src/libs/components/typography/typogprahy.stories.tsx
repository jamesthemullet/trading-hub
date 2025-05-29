import type { Meta, StoryObj } from '@storybook/react';

import { Typography } from './typography.styles';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    isStrong: {
      description: 'Bold text',
      control: 'boolean',
    },
    withMargin: {
      description: 'Adds margin to component',
      control: 'boolean',
    },
    as: {
      description: 'Defines element type (e.g., "p", "h1")',
      control: 'select',
    },
    variant: {
      description: 'Typography styles',
      control: 'select',
    },
    children: {
      description: 'Text value',
      control: 'text',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default = {
  args: {
    children: 'Lorem ipsum',
    variant: 'bodyMedium',
    as: 'p',
    isStrong: false,
    withMargin: false,
  },
  render: (args) => <Typography {...args} />,
} satisfies Story;
