import { useState } from 'react';

import { Button, Typography } from '@/libs/components';
import { track } from '@/libs/hooks/utils/analytics';

import { ModalUnsavedChanges } from '../modals';
import styles from './product-grid-header.module.css';

type Props = {
  canSave: boolean;
  hasChanges: boolean;
  hasPreview: boolean;
  isNewRuleSet: boolean;
  onCancel: () => void;
  onPreview?: () => void;
  onSave: () => void;
  shouldHidePreview: boolean;
  title: string;
  rulesetType: string;
  isWriteEnabled: boolean;
};

export const ProductGridHeader = ({
  canSave,
  hasChanges,
  hasPreview,
  isNewRuleSet,
  onCancel,
  onPreview,
  onSave,
  shouldHidePreview,
  title,
  rulesetType,
  isWriteEnabled,
}: Props) => {
  const [showModal, setShowModal] = useState(false);

  const onCancelChange = () => {
    if (hasChanges) {
      setShowModal(true);
    } else {
      onCancel();
    }
  };

  const isSaveButtonDisabled = !canSave;

  return (
    <>
      <div className={styles.ruleSetOptions}>
        <Typography as="h1" isStrong variant="titleMedium">
          {title}
        </Typography>
        <div className={styles.actions}>
          <Button onClick={onCancelChange}>Cancel</Button>
          {!shouldHidePreview && (
            <Button onClick={onPreview} isDisabled={!hasPreview}>
              Preview
            </Button>
          )}
          {isWriteEnabled && (
            <Button
              theme="primary"
              isDisabled={isSaveButtonDisabled}
              onClick={() => {
                track({
                  event: `${isNewRuleSet ? 'Create' : 'Save'} ${rulesetType} rule`,
                });
                onSave();
              }}
            >
              {isNewRuleSet ? 'Create' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {showModal && (
        <ModalUnsavedChanges
          onClose={onCancel}
          onContinue={() => setShowModal(false)}
        />
      )}
    </>
  );
};
