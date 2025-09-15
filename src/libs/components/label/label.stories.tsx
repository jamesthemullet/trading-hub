import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { LabelProps } from './label';
import { Label } from './label';

const meta: Meta<LabelProps> = {
  title: 'Components/Label',
  tags: ['autodocs'],
  component: Label,
  argTypes: {
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
    isHidden: false,
    isRequired: false,
  },
};
export const Disabled: Story = {
  args: {
    ...Default.args,
  },
};
export const Required: Story = {
  args: {
    ...Default.args,
    isRequired: true,
  },
};
