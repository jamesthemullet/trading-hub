import type { ReactElement } from 'react';
import { useState } from 'react';

import type { LastChanged } from '@/libs/components';
import { Button, LastSavedBy, Typography } from '@/libs/components';
import { track } from '@/libs/hooks/utils/analytics';

import { ModalUnsavedChanges } from '../modals';
import styles from './product-grid-header.module.css';

type Props = {
  canSave: boolean;
  hasChanges: boolean;
  hasPreview: boolean;
  isNewRuleSet: boolean;
  lastChanged?: LastChanged;
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
  lastChanged,
  onCancel,
  onPreview,
  onSave,
  shouldHidePreview,
  title,
  rulesetType,
  isWriteEnabled,
}: Props): ReactElement => {
  const [shouldShowModal, setShouldShowModal] = useState(false);

  const onCancelChange = () => {
    if (hasChanges) {
      setShouldShowModal(true);
    } else {
      onCancel();
    }
  };

  const isSaveButtonDisabled = !canSave;

  return (
    <>
      <div className={styles.ruleSetOptions}>
        <div className={styles.titleColumn}>
          <Typography as="h1" isStrong variant="titleMedium">
            {title}
          </Typography>

          <LastSavedBy lastChanged={lastChanged} className={styles.lastSaved} />
        </div>

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

      {shouldShowModal && (
        <ModalUnsavedChanges
          onClose={onCancel}
          onContinue={() => setShouldShowModal(false)}
        />
      )}
    </>
  );
};
