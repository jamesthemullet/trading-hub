import type { ComponentProps } from 'react';

import { Typography } from '@/libs/components';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    isStrong: {
      description: 'Bold text',
      control: 'boolean',
    },
    hasMargin: {
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

type DefaultStoryArgs = ComponentProps<typeof Typography>;

export const Default: Story = {
  args: {
    children: 'Lorem ipsum',
    variant: 'bodyMedium',
    as: 'p',
    isStrong: false,
    hasMargin: false,
  } satisfies DefaultStoryArgs,
  render: (args: DefaultStoryArgs) => <Typography {...args} />,
} satisfies Story;
