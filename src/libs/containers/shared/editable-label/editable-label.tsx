import { useEffect, useState } from 'react';

import { Typography } from '@/libs/components/typography/typography';

import Image from 'next/image';

import styles from './editable-label.module.css';

type EditableLabelProps = {
  displayValue: string;
  onDisplayValueChange: (newValue: string) => void;
  setError: (message: string) => void;
  showErrorState: boolean;
  showEditState?: boolean;
  handleUpdatedValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
  canCancelEdit?: boolean;
  onCancel?: () => void;
  disallowedValues?: string[];
  disallowedErrorMessage?: string;
  writeEnabled?: boolean;
};

export const EditableLabel = ({
  displayValue,
  onDisplayValueChange,
  setError,
  showErrorState,
  showEditState,
  handleUpdatedValue,
  canCancelEdit,
  onCancel,
  disallowedErrorMessage,
  writeEnabled = true,
}: EditableLabelProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalValue] = useState(displayValue);
  const [value, setValue] = useState(displayValue);

  useEffect(() => {
    if (showErrorState || showEditState) {
      setIsEditMode(true);
    }
  }, [showErrorState, showEditState, displayValue]);

  return (
    <div className={styles.displayName}>
      <div className={styles.nameContainer}>
        {isEditMode ? (
          <>
            <div className={styles.inputContainer}>
              <input
                id="input"
                ref={(inputRef) => {
                  inputRef?.focus();
                }}
                onChange={(event) => {
                  handleUpdatedValue(event);
                  setValue(event.target.value);
                }}
                value={value}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !showErrorState) {
                    setIsEditMode(false);
                    onDisplayValueChange(value);
                  }
                  if (event.key === 'Escape' && canCancelEdit) {
                    setValue(originalValue);
                    setIsEditMode(false);
                    // istanbul ignore else
                    if (onCancel) onCancel();
                  }
                }}
                aria-label={`Edit ${displayValue} input field`}
                data-error={showErrorState}
                className={`${styles.input} typographyBodySmall`}
              />

              {showErrorState && (
                <Image
                  width={20}
                  height={20}
                  src="/trading-hub/asset/icon-warning.svg"
                  alt=""
                />
              )}
            </div>

            <div className={styles.editConfirmationButtons}>
              <button
                className={styles.editButton}
                onClick={() => {
                  onDisplayValueChange(value);
                  setIsEditMode(false);
                }}
                aria-label={`Save ${displayValue} change`}
                disabled={showErrorState}
              >
                <Image
                  width={20}
                  height={20}
                  src="/trading-hub/asset/icon-tick-in-circle.svg"
                  alt=""
                />
              </button>
              {canCancelEdit && (
                <button
                  className={styles.editButton}
                  onClick={() => {
                    setValue(originalValue);
                    setIsEditMode(false);
                    setError('');
                    // istanbul ignore else
                    if (onCancel) onCancel();
                  }}
                  aria-label={`Cancel ${displayValue} change`}
                >
                  <Image
                    width={20}
                    height={20}
                    src="/trading-hub/asset/icon-cross-in-circle.svg"
                    alt=""
                  />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <Typography
              data-testid={`Label for ${displayValue}`}
              variant="bodySmall"
            >
              {displayValue}
            </Typography>

            {writeEnabled && (
              <button
                className={styles.editButton}
                onClick={() => {
                  setIsEditMode(true);
                }}
                aria-label={`Edit display name for ${displayValue}`}
              >
                <Image
                  width={20}
                  height={20}
                  src="/trading-hub/asset/icon-edit-pencil.svg"
                  alt=""
                />
              </button>
            )}
          </>
        )}
      </div>
      {showErrorState && (
        <div className={styles.errorMessage}>
          <Typography variant="bodySmall">{disallowedErrorMessage}</Typography>
        </div>
      )}
    </div>
  );
};
