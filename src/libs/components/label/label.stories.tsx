import type { Meta, StoryObj } from '@storybook/react';

import type { LabelProps } from './label';
import { Label } from './label';

const meta: Meta<LabelProps> = {
  title: 'Components/Label',
  tags: ['autodocs'],
  component: Label,
  argTypes: {
    isDisabled: {
      control: 'boolean',
      description: 'Disables the label',
    },
    isHidden: {
      control: 'boolean',
      description: 'Visually hides the label',
    },
    isRequired: {
      control: 'boolean',
      description: 'Displays required field indicator',
    },
    children: {
      control: 'text',
      description: 'The text content of the label',
    },
  },
};

export default meta;
type Story = StoryObj<LabelProps>;

export const Default: Story = {
  args: {
    children: 'Label Text',
    isDisabled: false,
    isHidden: false,
    isRequired: false,
  },
};
export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};
export const Required: Story = {
  args: {
    ...Default.args,
    isRequired: true,
  },
};
