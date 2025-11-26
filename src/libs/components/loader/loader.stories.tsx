import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Loader } from './loader';
import styles from './loader.module.css';

const meta: Meta<typeof Loader> = {
  title: 'Components/Loader',
  component: Loader,
  tags: ['autodocs'],
  argTypes: {
    isInModal: {
      control: 'boolean',
      description: 'Whether the loader is displayed inside a modal',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    isInModal: false,
  },
};

export const InModal: Story = {
  args: {
    isInModal: true,
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className={styles.modalContainer}>
        <Story />
      </div>
    ),
  ],
};
