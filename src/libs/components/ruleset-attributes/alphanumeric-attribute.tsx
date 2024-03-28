import { spacing } from '../utils/spacing';
import { Text } from '../typography/typography.styles';

import {
  AttributeWrapper,
  AttributeHeading,
  AttributeRow,
  AttributeValue,
} from './ruleset-attributes.styles';
import { AttributeWeight } from './weight';

export const AlphanumericAttribute = ({
  isEditable,
  values,
  operation,
  weight = 1.0,
}: {
  isEditable?: boolean;
  values: string[];
  operation: 'bury' | 'boost';
  weight?: number;
}) => (
  <AttributeWrapper>
    <AttributeHeading>
      {values.map((value) => (
        <AttributeValue key={value}>{value}</AttributeValue>
      ))}
    </AttributeHeading>
    <AttributeRow style={{ padding: spacing(1) }}>
      <Text>
        Operation{' '}
        <img
          src={`/trading-hub/asset/${operation}.svg`}
          style={{ marginBottom: '-4px' }}
        />{' '}
        {operation}
      </Text>
    </AttributeRow>
    <AttributeWeight weight={weight} isEditable={isEditable} />
  </AttributeWrapper>
);
