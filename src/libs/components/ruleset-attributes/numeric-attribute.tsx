import Image from 'next/image';
import { NumericBoostBury } from '../../api';
import { Label, Text } from '../typography/typography.styles';

import {
  AttributeWrapper,
  AttributeHeading,
  AttributeRow,
} from './ruleset-attributes.styles';
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
  operation: 'bury' | 'boost';
  weight?: number;
}) => (
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
          src={`/trading-hub/asset/${operation}-signifier.svg`}
          style={{ marginBottom: '-4px' }}
        />{' '}
        {operation}
      </Text>
    </AttributeRow>
    <AttributeWeight
      weight={weight}
      isEditable={isEditable}
      onChangeAttribute={onChangeAttribute}
      onDelete={() => onDelete && onDelete({ field: name, weight })}
    />
  </AttributeWrapper>
);
