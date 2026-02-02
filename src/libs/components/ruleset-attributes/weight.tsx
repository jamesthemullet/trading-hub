import { useEffect, useState } from 'react';

import { Typography } from '@/libs/components';

import Image from 'next/image';

import styles from './ruleset-attributes.module.css';

export const AttributeWeight = ({
  weight,
  field,
  isEditable,
  isEditing,
  canEditWeight,
  onChangeSubmit,
  onDelete,
  onStartChanges,
  onCancelChanges,
}: {
  weight: number;
  field?: string;
  isEditable?: boolean;
  isEditing?: boolean;
  canEditWeight?: boolean;
  onChangeSubmit?: (args: { weight: number }) => void;
  onDelete?: () => void;
  onStartChanges: () => void;
  onCancelChanges?: () => void;
}) => {
  const [value, setValue] = useState(weight);
  const [error, setError] = useState('');

  const onSubmit = () => {
    onChangeSubmit?.({ weight: value });
  };

  useEffect(() => {
    setValue(weight);
  }, [weight]);

  return (
    <>
      {canEditWeight && (
        <div className={styles.attributeRow}>
          {isEditing ? (
            <form>
              <Typography as="label" variant="bodySmall">
                Strength{' '}
                <input
                  value={value ? value : ''}
                  onChange={(e) => {
                    const { value } = e.target;
                    const weight = parseInt(value || '0');
                    if (weight < 1 || weight > 100) {
                      setError('Weight must be between 1 and 100');
                    } else {
                      setError('');
                    }
                    /* istanbul ignore next */
                    setValue(parseInt(value || '0'));
                  }}
                  type="number"
                  step={1}
                  min={0}
                  max={100}
                />{' '}
                %
              </Typography>
            </form>
          ) : (
            <Typography variant="bodySmall">
              Strength {Math.round(isEditable ? value : weight)}%
            </Typography>
          )}
        </div>
      )}
      {isEditable && !isEditing && (
        <div className={styles.attributeRow}>
          <div className={styles.buttons}>
            <button
              type="button"
              onClick={() => onStartChanges()}
              aria-label={`Edit attribute ${field}`}
            >
              <Image
                width={20}
                height={20}
                src="/trading-hub/asset/icon-edit.svg"
                alt=""
              />
            </button>

            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete attribute"
            >
              <Image
                width={20}
                height={20}
                src="/trading-hub/asset/icon-delete.svg"
                alt=""
              />
            </button>
          </div>
        </div>
      )}
      {isEditable && isEditing && (
        <div className={styles.attributeRow}>
          {error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <div className={styles.buttons}>
              <button
                type="button"
                onClick={onSubmit}
                aria-label={`Save attribute ${field} change`}
              >
                <Image
                  width={20}
                  height={20}
                  src="/trading-hub/asset/icon-tick-in-circle.svg"
                  alt=""
                />
              </button>
              <button
                type="button"
                onClick={
                  /* istanbul ignore next */
                  () => {
                    setValue(weight);
                    onCancelChanges?.();
                  }
                }
                aria-label={`Cancel attribute ${field} change`}
              >
                <Image
                  width={20}
                  height={20}
                  src="/trading-hub/asset/icon-cross-in-circle.svg"
                  alt=""
                />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
