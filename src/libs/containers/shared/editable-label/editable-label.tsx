import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/libs/components';
import { Typography } from '@/libs/components/typography/typography';
import { Input } from '@/libs/containers/shared/input/input';

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
  isWriteEnabled: boolean;
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
  isWriteEnabled,
}: EditableLabelProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalValue, setOriginalValue] = useState(displayValue);
  const [value, setValue] = useState(displayValue);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditMode) {
      inputRef.current?.focus();
    }
  }, [isEditMode]);

  useEffect(() => {
    if (showErrorState || showEditState) {
      setIsEditMode(true);
    }
  }, [showErrorState, showEditState]);

  useEffect(() => {
    if (!isEditMode) {
      setOriginalValue(displayValue);
      setValue(displayValue);
    }
  }, [displayValue, isEditMode]);

  return (
    <div className={styles.displayName}>
      <div className={styles.nameContainer}>
        {isEditMode ? (
          <>
            <div className={styles.inputContainer}>
              <Input
                id={inputId}
                ref={inputRef}
                label={`Edit ${displayValue} input field`}
                isLabelHidden
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
                aria-invalid={showErrorState}
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
              <Button
                appearance="icon"
                type="button"
                className={styles.editButton}
                onClick={() => {
                  onDisplayValueChange(value);
                  setIsEditMode(false);
                }}
                aria-label={`Save ${displayValue} change`}
                isDisabled={showErrorState}
              >
                <Image
                  width={20}
                  height={20}
                  src="/trading-hub/asset/icon-tick-in-circle.svg"
                  alt=""
                />
              </Button>
              {canCancelEdit && (
                <Button
                  appearance="icon"
                  type="button"
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
                </Button>
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

            {isWriteEnabled && (
              <Button
                appearance="icon"
                type="button"
                className={styles.editButton}
                onClick={() => {
                  setOriginalValue(displayValue);
                  setValue(displayValue);
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
              </Button>
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
