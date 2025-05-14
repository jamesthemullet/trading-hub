import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

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
    as: {
      description: 'Defines element type (e.g., "input", "textarea")',
      table: { disable: true },
    },
    defaultValue: {
      description: 'Initial value for the input field',
      control: 'text',
    },
    message: {
      description: 'Object containing message variant and text',
      control: 'object',
    },
    isRequired: {
      description: 'Specifies if the input is required',
      control: 'boolean',
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
    defaultValue: '',
    message: {
      variant: 'info',
      text: 'This is an info message',
    },
    isRequired: false,
    onChange: fn(),
  },
  render: (args) => <Input {...args} />,
} satisfies Story;
