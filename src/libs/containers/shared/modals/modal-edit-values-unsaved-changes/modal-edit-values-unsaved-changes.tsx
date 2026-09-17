import type { ReactElement } from 'react';
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
}: Props): ReactElement => {
  return (
    <Modal.Root opened onClose={onCancel} centered padding={10} size={460}>
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
              {isNewlyIncluded
                ? 'Save required to continue'
                : 'You have unsaved changes'}
            </Typography>
          </Modal.Title>
          <Typography variant="bodySmall">
            {isNewlyIncluded
              ? 'You’ve changed this facet to Include only, but haven’t saved it. Your changes will be saved before you continue to Edit facet values. Do you want to continue?'
              : 'Navigating to edit facet values will save your unsaved changes. Do you want to continue?'}
          </Typography>
          <span className={styles.divider} />
          <div className={styles.buttons}>
            <Button onClick={onCancel} theme="primary" isInline data-autofocus>
              Stay on page
            </Button>
            <Button isInline onClick={onConfirm}>
              Save changes and continue
            </Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
