import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { FormLabelProps } from './form-label';
import { FormLabel } from './form-label';

const meta: Meta<FormLabelProps> = {
  title: 'Components/Form Label',
  tags: ['autodocs'],
  component: FormLabel,
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
type Story = StoryObj<FormLabelProps>;

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
