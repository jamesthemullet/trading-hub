import { spacing } from '../utils/spacing';
import { Label, Text } from '../typography/typography.styles';

import {
  AttributeWrapper,
  AttributeHeading,
  AttributeRow,
  AttributeValue,
} from './ruleset-attributes.styles';
import { AttributeWeight } from './weight';
import { AlphanumericBoostBury } from '../../api';
import Image from 'next/image';

export const AlphanumericAttribute = ({
  isEditable,
  fields,
  operation,
  weight,
}: AlphanumericBoostBury & {
  isEditable?: boolean;
  operation: 'bury' | 'boost';
}) => (
  <AttributeWrapper>
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
    <AttributeWeight weight={weight} isEditable={isEditable} />
  </AttributeWrapper>
);
