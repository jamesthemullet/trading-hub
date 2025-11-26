import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { InfoBox } from './info-box';

const meta: Meta<typeof InfoBox> = {
  title: 'Components/InfoBox',
  component: InfoBox,
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'The informational text to display',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof InfoBox>;

export const Default: Story = {
  args: {
    text: 'This is an informational message for the user.',
  },
};
