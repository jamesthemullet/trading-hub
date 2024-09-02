import Image from 'next/image';

import { AlphanumericBoostBury, AlphanumericBoostBuryField } from '../../api';
import { Label, Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import {
  AttributeHeading,
  AttributeRow,
  AttributeValue,
  AttributeWrapper,
  Button,
  Buttons,
} from './ruleset-attributes.styles';
import { labels } from './utils';
import { AttributeWeight } from './weight';

export const AlphanumericAttribute = ({
  fields,
  isEditable,
  operation,
  onChangeAttribute,
  onDelete,
  weight,
}: {
  fields: Array<AlphanumericBoostBuryField>;
  operation: 'boosts' | 'buries' | 'includes' | 'excludes';
  weight?: number;
  isEditable?: boolean;
  onChangeAttribute?: (args: { newWeight: number }) => void;
  onDelete?: (args: AlphanumericBoostBury) => void;
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
          alt=""
          src={`/trading-hub/asset/${labels[operation].icon}.svg`}
          style={{ marginBottom: '-4px' }}
        />{' '}
        {labels[operation].text}
      </Text>
    </AttributeRow>
    {weight && (
      <AttributeWeight
        weight={weight}
        isEditable={isEditable}
        onChangeAttribute={onChangeAttribute}
        onDelete={() => onDelete && onDelete({ fields, weight })}
      />
    )}
    {!weight && isEditable && (
      <AttributeRow>
        <Buttons>
          <Button
            onClick={() => onDelete && onDelete({ fields, weight: 0 })}
            aria-label="Delete attribute"
          >
            <Image
              width={20}
              height={20}
              src="/trading-hub/asset/icon-delete.svg"
              alt=""
            />
          </Button>
        </Buttons>
      </AttributeRow>
    )}
  </AttributeWrapper>
);
