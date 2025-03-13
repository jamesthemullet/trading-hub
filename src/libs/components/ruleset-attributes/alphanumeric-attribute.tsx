import Image from 'next/image';

import type {
  AlphanumericBoostBury,
  AlphanumericBoostBuryField,
} from '../../api';
import { Label, Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import {
  AttributeHeading,
  AttributeRow,
  AttributeValueList,
  AttributeValuePill,
  AttributeWrapper,
} from './ruleset-attributes.styles';
import { labels } from './utils';
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
  fields: Array<AlphanumericBoostBuryField>;
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  weight?: number;
  isEditable?: boolean;
  isEditMode?: boolean;
  canEditWeight?: boolean;
  setWeight?: (weight: number) => void;
  onDelete?: (args: AlphanumericBoostBury) => void;
  onEdit?: (args: { fields: AlphanumericBoostBuryField[] }) => void;
}) => {
  const handleStartChanges = () => {
    onEdit?.({ fields });
  };

  return (
    <AttributeWrapper>
      <AttributeHeading>
        {fields.map(({ field, values }) => (
          <div key={`field-${field}`}>
            <Label isStrong>{field}</Label>

            <AttributeValueList>
              {values.map((value) => (
                <AttributeValuePill key={value}>
                  <span>{value}</span>
                </AttributeValuePill>
              ))}
            </AttributeValueList>
          </div>
        ))}
      </AttributeHeading>

      <AttributeRow style={{ padding: spacing(1) }}>
        <Text>
          Operation{' '}
          <Image
            width={20}
            height={20}
            alt=""
            src={`/trading-hub/asset/${labels[operation].icon}.svg`}
            style={{ marginBottom: '-4px' }}
          />{' '}
          {labels[operation].text}
        </Text>
      </AttributeRow>

      {isEditMode && canEditWeight ? (
        <AttributeRow>
          <Text as="label">
            Strength{' '}
            <input
              value={weight ? weight : ''}
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
          </Text>
        </AttributeRow>
      ) : (
        <AttributeWeight
          weight={weight || 0}
          field={fields[0].field}
          isEditable={isEditable}
          onDelete={() => onDelete && onDelete({ fields, weight: weight || 0 })}
          onStartChanges={handleStartChanges}
          canEditWeight={canEditWeight}
        />
      )}
    </AttributeWrapper>
  );
};
