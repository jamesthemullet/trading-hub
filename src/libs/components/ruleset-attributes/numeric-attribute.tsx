import type { MerchandisingNumericBoostBury } from '@/libs/api';
import { Typography } from '@/libs/components';
import { labels } from '@/libs/utils/ruleset-attributes';

import Image from 'next/image';

import styles from './ruleset-attributes.module.css';
import { AttributeWeight } from './weight';

export const NumericAttribute = ({
  isEditable,
  name,
  operation,
  weight,
  isEditMode,
  onDelete,
  onEdit,
  setWeight,
}: {
  isEditable?: boolean;
  name: string;
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  weight: number;
  isEditMode?: boolean;
  onDelete?: ({ field, weight }: MerchandisingNumericBoostBury) => void;
  onEdit?: (args: { field: MerchandisingNumericBoostBury }) => void;
  setWeight?: (weight: number) => void;
}) => {
  const handleStartChanges = () => {
    onEdit?.({ field: { weight, field: name } });
  };

  return (
    <div className={styles.attributeWrapper}>
      <div className={styles.attributeHeading}>
        <Typography variant="bodyMedium" isStrong>
          {name}
        </Typography>
      </div>

      <div className={styles.attributeRow}>
        <Typography variant="bodySmall">
          Operation{' '}
          <Image
            width={20}
            height={20}
            alt=""
            src={`/trading-hub/asset/icon-${operation}.svg`}
          />{' '}
          {labels[operation].text}
        </Typography>
      </div>

      {!isEditMode && (
        <AttributeWeight
          weight={weight}
          field={name}
          isEditable={isEditable}
          onDelete={() => onDelete?.({ field: name, weight })}
          onStartChanges={handleStartChanges}
          canEditWeight
        />
      )}

      {isEditMode && (
        <div className={styles.attributeRow}>
          <Typography as="label" variant="bodySmall">
            Strength{' '}
            <input
              value={weight}
              onChange={(e) => {
                const { value } = e.target;
                // istanbul ignore next
                setWeight?.(parseInt(value || '0'));
              }}
              type="number"
              step={1}
              min={0}
              max={100}
            />{' '}
            %
          </Typography>
        </div>
      )}
    </div>
  );
};
