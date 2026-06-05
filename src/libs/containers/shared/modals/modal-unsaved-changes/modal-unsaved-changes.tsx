import { Modal } from '@mantine/core';

import { Button } from '@/libs/components';
import { Typography } from '@/libs/components/typography/typography';

import styles from './modal-unsaved-changes.module.css';

type Props = {
  onClose: () => void;
  onContinue: () => void;
  opened?: boolean;
};

export const ModalUnsavedChanges = ({
  onClose,
  onContinue,
  opened = true,
}: Props) => {
  return (
    <Modal.Root opened={opened} onClose={onContinue} centered padding={10}>
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <Modal.Title component="div">
            <Typography
              as="h2"
              variant="bodySmall"
              isStrong
              className={styles.heading}
            >
              Close without saving edits
            </Typography>
          </Modal.Title>
          <Typography variant="bodySmall">
            Are you sure you want to navigate away from this page without saving
            your edits?
          </Typography>
          <span className={styles.divider} />
          <div className={styles.buttons}>
            <Button isInline onClick={onClose}>
              Close without saving
            </Button>
            <Button onClick={onContinue} theme="primary" isInline>
              Continue editing
            </Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
