import type {
  MerchandisingAlphanumericBoostBury,
  MerchandisingAlphanumericBoostBuryField,
} from '@/libs/api';
import { Typography } from '@/libs/components';
import { formatHTMLStrings } from '@/libs/utils/format-html-strings';
import { labels } from '@/libs/utils/ruleset-attributes';

import Image from 'next/image';

import styles from './ruleset-attributes.module.css';
import { AttributeWeight } from './weight';

export const AlphanumericAttribute = ({
  fields,
  operation,
  weight,
  isEditable,
  isEditMode,
  canEditWeight,
  setWeight,
  onDelete,
  onEdit,
}: {
  fields: Array<MerchandisingAlphanumericBoostBuryField>;
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  weight?: number;
  isEditable?: boolean;
  isEditMode?: boolean;
  canEditWeight?: boolean;
  setWeight?: (weight: number) => void;
  onDelete?: (args: MerchandisingAlphanumericBoostBury) => void;
  onEdit?: (args: {
    fields: MerchandisingAlphanumericBoostBuryField[];
  }) => void;
}) => {
  const handleStartChanges = () => {
    onEdit?.({ fields });
  };

  return (
    <div className={styles.attributeWrapper}>
      <div className={styles.attributeHeading}>
        {fields.map(({ field, values }) => (
          <div key={`field-${field}`}>
            <Typography variant="bodyMedium" isStrong>
              {field}
            </Typography>

            <div className={styles.attributeValueList}>
              {values.map((value) => (
                <div className={styles.attributeValuePill} key={value}>
                  <Typography variant="bodySmall">
                    {formatHTMLStrings(value)}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.attributeRow}>
        <Typography variant="bodySmall">
          Operation
          <Image
            width={20}
            height={20}
            alt=""
            src={`/trading-hub/asset/icon-${operation}.svg`}
          />{' '}
          {labels[operation].text}
        </Typography>
      </div>

      {isEditMode && canEditWeight ? (
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
      ) : (
        <AttributeWeight
          weight={weight || 0}
          field={fields[0].field}
          isEditable={isEditable}
          onDelete={() => onDelete?.({ fields, weight: weight || 0 })}
          onStartChanges={handleStartChanges}
          canEditWeight={canEditWeight}
        />
      )}
    </div>
  );
};
