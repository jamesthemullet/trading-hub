import type { ReactElement } from 'react';
import { Divider, Modal } from '@mantine/core';

import { Button, Typography } from '@/libs/components';

import styles from './confirmation-modal.module.css';

const ConfirmationModal = ({
  onCloseModal,
  handleModalConfirm,
}: {
  onCloseModal: () => void;
  handleModalConfirm: () => void;
}): ReactElement => {
  return (
    <Modal.Body>
      <Modal.Title>
        <Typography as="span" variant="titleMedium" hasMargin isStrong>
          Apply global changes
        </Typography>
      </Modal.Title>

      <Typography variant="bodySmall" hasMargin>
        This action will apply live changes on the M&S website and app. Do you
        want to proceed?
      </Typography>

      <Divider />

      <div className={styles.buttons}>
        <Button
          onClick={onCloseModal}
          theme="secondary"
          aria-label="Close confirmation modal"
          isInline
        >
          Cancel
        </Button>

        <Button
          onClick={() => {
            handleModalConfirm();
          }}
          theme="primary"
          data-autofocus
          isInline
        >
          Apply action
        </Button>
      </div>
    </Modal.Body>
  );
};
export default ConfirmationModal;
