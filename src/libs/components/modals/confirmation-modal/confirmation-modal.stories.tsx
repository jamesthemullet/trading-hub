import { useState } from 'react';
import { Modal } from '@mantine/core';

import { Button } from '@/libs/components';

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import ConfirmationModal from './confirmation-modal';

const meta: Meta<typeof ConfirmationModal> = {
  title: 'Components/Modals/ConfirmationModal',
  component: ConfirmationModal,
  tags: ['autodocs'],
  argTypes: {
    onCloseModal: {
      action: 'onCloseModal',
      description: 'Handler for closing the modal',
    },
    handleModalConfirm: {
      action: 'handleModalConfirm',
      description: 'Handler for confirming the modal action',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof ConfirmationModal>;

export const Default: Story = {
  args: {
    onCloseModal: fn(),
    handleModalConfirm: fn(),
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        theme="primary"
        data-autofocus
      >
        Open Confirmation Modal
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
          <ConfirmationModal
            onCloseModal={() => setIsOpen(false)}
            handleModalConfirm={args.handleModalConfirm}
          />
        </Modal.Content>
      </Modal.Root>
    </>
  )
  },
};