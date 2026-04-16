import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    id: {
      description: 'Unique identifier for the input component',
      control: 'text',
    },
    label: {
      description: 'Label displayed for the input component',
      control: 'text',
    },
    isLabelHidden: {
      description: 'Whether the label is visually hidden',
      control: 'boolean',
    },
    size: {
      description: 'Size variant for the input height',
      control: {
        type: 'select',
        options: ['default', 'medium', 'small'],
      },
    },
    labelVariant: {
      description: 'Typography variant used for the visible label',
      control: {
        type: 'select',
        options: ['labelLarge', 'labelMedium', 'labelSmall'],
      },
    },
    as: {
      description: 'Defines element type (e.g., "input", "textarea")',
      table: { disable: true },
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default = {
  args: {
    id: 'input-id',
    label: 'Input Label',
    isLabelHidden: false,
    labelVariant: 'labelMedium',
    onChange: fn(),
  },
  render: (args) => <Input {...args} />,
} satisfies Story;
