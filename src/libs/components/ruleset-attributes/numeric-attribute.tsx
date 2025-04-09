import Image from 'next/image';

import type { MerchandisingNumericBoostBury } from '../../api';
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
    onEdit?.({ field: { weight: weight, field: name } });
  };

  return (
    <AttributeWrapper>
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
          onDelete={() => onDelete && onDelete({ field: name, weight })}
          onStartChanges={handleStartChanges}
          canEditWeight
        />
      )}

      {isEditMode && (
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
      )}
    </AttributeWrapper>
  );
};
