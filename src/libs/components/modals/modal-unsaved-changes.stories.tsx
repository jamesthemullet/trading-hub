import { useState } from 'react';
import { Modal } from '@mantine/core';

import { Button } from '@/libs/components';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { ModalUnsavedChanges } from './modal-unsaved-changes';

const meta: Meta<typeof ModalUnsavedChanges> = {
  title: 'Components/Modals/ModalUnsavedChanges',
  component: ModalUnsavedChanges,
  tags: ['autodocs'],
  argTypes: {
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
    onClose: fn(),
    onContinue: fn(),
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)} theme="primary">
          Open Unsaved Changes Modal
        </Button>

        <Modal.Root
          centered
          opened={isOpen}
          onClose={() => setIsOpen(false)}
          padding={10}
          role="dialog"
          aria-modal="true"
        >
          <Modal.Overlay blur={3} />
          <Modal.Content>
            <ModalUnsavedChanges
              onClose={() => {
                setIsOpen(false);
                args.onClose();
              }}
              onContinue={() => {
                setIsOpen(false);
                args.onContinue();
              }}
            />
          </Modal.Content>
        </Modal.Root>
      </>
    );
  },
};
