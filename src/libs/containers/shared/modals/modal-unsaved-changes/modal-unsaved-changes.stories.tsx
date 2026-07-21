import { useState } from 'react';

import { Button } from '@/libs/components';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ModalUnsavedChanges } from './modal-unsaved-changes';

const meta: Meta<typeof ModalUnsavedChanges> = {
  title: 'Components/Modals/ModalUnsavedChanges',
  component: ModalUnsavedChanges,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is open',
      defaultValue: true,
    },
    onClose: {
      action: 'onClose',
      description: 'Handler for Close without saving',
    },
    onContinue: {
      action: 'onContinue',
      description: 'Handler for Continue editing',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ModalUnsavedChanges>;

export const Default: Story = {
  args: {
    isOpen: false,
    onClose: fn(),
    onContinue: fn(),
  },
  render: (args) => <DefaultTemplate {...args} />,
};

const DefaultTemplate = (args: Story['args'] = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)} theme="primary">
        Open Unsaved Changes Modal
      </Button>
      <ModalUnsavedChanges
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          args.onClose?.();
        }}
        onContinue={() => {
          setIsOpen(false);
          args.onContinue?.();
        }}
      />
    </>
  );
};
