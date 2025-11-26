import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ErrorMessage } from './error-message';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
  argTypes: {
    centred: {
      control: {
        type: 'boolean',
      },
      description:
        'Centers the error message on the page with full viewport height',
    },
    children: {
      control: {
        type: 'text',
      },
      description: 'Error message text content',
    },
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
  args: {
    children: 'An error occurred while processing your request.',
    centred: false,
  },
};

export const Centred: Story = {
  args: {
    children: 'An error occurred while loading this page.',
    centred: true,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const LongMessage: Story = {
  args: {
    children:
      'We encountered an unexpected error while trying to save your changes. Please try again later, or contact support if the problem persists.',
    centred: false,
  },
};
