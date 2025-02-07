import { useState } from 'react';

import Image from 'next/image';

import { NumericBoostBury } from '../../api';
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
  onChangeAttribute,
  onDelete,
  operation,
  weight = 100,
}: {
  isEditable?: boolean;
  name: string;
  onChangeAttribute?: (args: { newWeight: number }) => void;
  onDelete?: ({ field, weight }: NumericBoostBury) => void;
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  weight?: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = ({ weight }: { weight: number }) => {
    onChangeAttribute?.({ newWeight: weight });
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
      <AttributeWeight
        weight={weight}
        field={name}
        isEditable={isEditable}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onChangeSubmit={handleSubmit}
        onDelete={() => onDelete && onDelete({ field: name, weight })}
      />
    </AttributeWrapper>
  );
};
