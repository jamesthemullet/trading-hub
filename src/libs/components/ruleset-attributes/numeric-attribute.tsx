import Image from 'next/image';
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
  operation,
  weight = 1.0,
}: {
  isEditable?: boolean;
  name: string;
  operation: 'bury' | 'boost';
  weight?: number;
}) => (
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
          src={`/trading-hub/asset/${operation}-signifier.svg`}
          style={{ marginBottom: '-4px' }}
        />{' '}
        {operation}
      </Text>
    </AttributeRow>
    <AttributeWeight weight={weight} isEditable={isEditable} />
  </AttributeWrapper>
);
