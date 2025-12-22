import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { InputDeprecated } from './input';

const meta: Meta<typeof InputDeprecated> = {
  title: 'Components/Input',
  component: InputDeprecated,
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
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof InputDeprecated>;

export const Default = {
  args: {
    id: 'input-id',
    label: 'Input Label',
    isLabelHidden: false,
    onChange: fn(),
  },
  render: (args) => <InputDeprecated {...args} />,
} satisfies Story;
