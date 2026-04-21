import { useId } from 'react';
import { Modal } from '@mantine/core';

import { Button } from '@/libs/components';
import { Typography } from '@/libs/components/typography/typography';

import styles from './modal-edit-values-unsaved-changes.module.css';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  isNewlyIncluded?: boolean;
};

export const ModalEditValuesUnsavedChanges = ({
  onConfirm,
  onCancel,
  isNewlyIncluded = false,
}: Props) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal.Root opened onClose={onCancel} centered padding={10} size={460}>
      <Modal.Overlay blur={3} />
      <Modal.Content aria-labelledby={titleId} aria-describedby={descriptionId}>
        <Modal.Body>
          <Typography
            as="h2"
            id={titleId}
            variant="bodySmall"
            isStrong
            className={styles.heading}
          >
            You have unsaved changes
          </Typography>
          <Typography id={descriptionId} variant="bodySmall">
            Navigating to edit facet values will discard your unsaved changes.
            Do you want to continue?
          </Typography>
          {isNewlyIncluded && (
            <>
              <br />
              <Typography variant="bodySmall">
                Note: as this facet was recently set to &lsquo;include
                only&rsquo;, any changes made in the edit values screen will
                also not be saved.
              </Typography>
            </>
          )}
          <span className={styles.divider} />
          <div className={styles.buttons}>
            <Button onClick={onCancel} theme="primary" isInline data-autofocus>
              Stay on page
            </Button>
            <Button isInline onClick={onConfirm}>
              Discard changes and continue
            </Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
