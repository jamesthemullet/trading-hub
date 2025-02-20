import { useContext, useState } from 'react';

import Image from 'next/image';

import { NumericBoostBury } from '../../api';
import { FeatureFlagContext } from '../context/feature-flag';
import { Label, Text } from '../typography/typography.styles';
import {
  AttributeHeading,
  AttributeRow,
  AttributeWrapper,
} from './ruleset-attributes.styles';
import { labels } from './utils';
import { AttributeWeight } from './weight';

export const NumericAttribute = ({
  isEditable,
  name,
  operation,
  weight,
  isEditMode,
  onChangeAttribute,
  onDelete,
  onEdit,
  setWeight,
}: {
  isEditable?: boolean;
  name: string;
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  weight: number;
  isEditMode?: boolean;
  onChangeAttribute?: (args: { newWeight: number }) => void;
  onDelete?: ({ field, weight }: NumericBoostBury) => void;
  onEdit?: (args: { field: NumericBoostBury }) => void;
  setWeight?: (weight: number) => void;
}) => {
  const featureFlags = useContext(FeatureFlagContext);

  const [isEditing, setIsEditing] = useState(false);

  const handleChangeSubmit = ({ weight }: { weight: number }) => {
    onChangeAttribute?.({ newWeight: weight });
    setIsEditing(false);
  };

  const handleStartChanges = () => {
    if (featureFlags.hasAttributeEdit) {
      onEdit?.({ field: { weight: weight, field: name } });
    } else {
      setIsEditing(true);
    }
  };

  return (
    <AttributeWrapper aria-label="Product Attribute">
      <AttributeHeading>
        <Label isStrong>{name}</Label>
      </AttributeHeading>

      <AttributeRow>
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

      {!isEditMode && (
        <AttributeWeight
          weight={weight}
          field={name}
          isEditable={isEditable}
          isEditing={isEditing}
          onChangeSubmit={handleChangeSubmit}
          onDelete={() => onDelete && onDelete({ field: name, weight })}
          onStartChanges={handleStartChanges}
          onCancelChanges={() => setIsEditing(false)}
          canEditWeight
        />
      )}

      {isEditMode && (
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
      )}
    </AttributeWrapper>
  );
};
