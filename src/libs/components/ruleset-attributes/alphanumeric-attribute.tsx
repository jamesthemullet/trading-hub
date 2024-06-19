import Image from 'next/image';

import { AlphanumericBoostBury } from '../../api';
import { Label, Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import {
  AttributeHeading,
  AttributeRow,
  AttributeValue,
  AttributeWrapper,
} from './ruleset-attributes.styles';
import { AttributeWeight } from './weight';

export const AlphanumericAttribute = ({
  fields,
  isEditable,
  operation,
  onChangeAttribute,
  onDelete,
  weight,
}: AlphanumericBoostBury & {
  isEditable?: boolean;
  onChangeAttribute?: (args: { newWeight: number }) => void;
  onDelete?: (args: AlphanumericBoostBury) => void;
  operation: 'bury' | 'boost';
}) => (
  <AttributeWrapper aria-label="Product Attribute">
    <AttributeHeading>
      {fields.map(({ field, values }) => (
        <div key={`field-${field}`}>
          <Label isStrong>{field}</Label>

          {values.map((value) => (
            <AttributeValue key={value}>{value}</AttributeValue>
          ))}
        </div>
      ))}
    </AttributeHeading>
    <AttributeRow style={{ padding: spacing(1) }}>
      <Text>
        Operation{' '}
        <Image
          width={20}
          height={20}
          src={`/trading-hub/asset/${operation}-signifier.svg`}
          style={{ marginBottom: '-4px' }}
          alt=""
        />{' '}
        {operation}
      </Text>
    </AttributeRow>
    <AttributeWeight
      weight={weight}
      isEditable={isEditable}
      onChangeAttribute={onChangeAttribute}
      onDelete={() => onDelete && onDelete({ fields, weight })}
    />
  </AttributeWrapper>
);
