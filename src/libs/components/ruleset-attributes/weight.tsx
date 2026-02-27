import { Button, Typography } from '@/libs/components';

import Image from 'next/image';

import styles from './ruleset-attributes.module.css';

export const AttributeWeight = ({
  weight,
  field,
  isEditable,
  canEditWeight,
  onDelete,
  onStartChanges,
}: {
  weight: number;
  field?: string;
  isEditable?: boolean;
  canEditWeight?: boolean;
  onDelete?: () => void;
  onStartChanges: () => void;
}) => {
  return (
    <>
      {canEditWeight && (
        <div className={styles.attributeRow}>
          <Typography variant="bodySmall">
            Strength {Math.round(weight)}%
          </Typography>
        </div>
      )}
      {isEditable && (
        <div className={styles.attributeRow}>
          <div className={styles.buttons}>
            <Button
              appearance="icon"
              isAutoSize
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
            </Button>

            <Button
              appearance="icon"
              isAutoSize
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
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
