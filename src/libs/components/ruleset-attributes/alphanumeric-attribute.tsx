import { useContext, useState } from 'react';

import Image from 'next/image';

import { AlphanumericBoostBury, AlphanumericBoostBuryField } from '../../api';
import { FeatureFlagContext } from '../context/feature-flag';
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
  onChangeAttribute,
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
  onChangeAttribute?: (args: AlphanumericBoostBury) => void;
  onDelete?: (args: AlphanumericBoostBury) => void;
  onEdit?: (args: { fields: AlphanumericBoostBuryField[] }) => void;
}) => {
  const featureFlags = useContext(FeatureFlagContext);

  const [isEditing, setIsEditing] = useState(false);

  const handleChangeSubmit = ({ weight }: { weight: number }) => {
    onChangeAttribute?.({ fields, weight });
    setIsEditing(false);
  };

  const handleStartChanges = () => {
    if (featureFlags.hasAttributeEdit) {
      onEdit?.({ fields });
    } else {
      setIsEditing(true);
    }
  };

  return (
    <AttributeWrapper aria-label="Product Attribute">
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
          <Text as="label" aria-label="Edit value">
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
          isEditing={isEditing}
          onChangeSubmit={handleChangeSubmit}
          onDelete={() => onDelete && onDelete({ fields, weight: weight || 0 })}
          onStartChanges={handleStartChanges}
          onCancelChanges={() => setIsEditing(false)}
          canEditWeight={canEditWeight}
        />
      )}
    </AttributeWrapper>
  );
};
