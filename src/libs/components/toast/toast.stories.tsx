import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Toast } from './toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: {
        type: 'text',
      },
    },
    autoDismissMs: {
      control: {
        type: 'number',
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    message: 'Changes have been saved successfully',
    onDismiss: fn(),
  },
};

export const AutoDismiss: Story = {
  args: {
    message: 'Changes have been saved successfully',
    autoDismissMs: 3000,
    onDismiss: fn(),
  },
};
