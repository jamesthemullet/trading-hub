import styled from '@emotion/styled';

import type {
  MerchandisingAlphanumericBoostBury,
  MerchandisingAlphanumericBoostBuryField,
} from '@/libs/api';
import {
  Text,
  Typography,
} from '@/libs/components/typography/typography.styles';
import { formatHTMLStrings } from '@/libs/utils/format-html-strings';
import { labels } from '@/libs/utils/ruleset-attributes';
import { spacing } from '@/libs/utils/spacing';

import Image from 'next/image';

import {
  AlignedText,
  AttributeHeading,
  AttributeRow,
  AttributeValueList,
  AttributeValuePill,
  AttributeWrapper,
} from './ruleset-attributes.styles';
import { AttributeWeight } from './weight';

const AttributeNameText = styled.span`
  word-break: break-word;
`;

export const AlphanumericAttribute = ({
  fields,
  operation,
  weight,
  isEditable,
  isEditMode,
  canEditWeight,
  setWeight,
  onDelete,
  onEdit,
}: {
  fields: Array<MerchandisingAlphanumericBoostBuryField>;
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  weight?: number;
  isEditable?: boolean;
  isEditMode?: boolean;
  canEditWeight?: boolean;
  setWeight?: (weight: number) => void;
  onDelete?: (args: MerchandisingAlphanumericBoostBury) => void;
  onEdit?: (args: {
    fields: MerchandisingAlphanumericBoostBuryField[];
  }) => void;
}) => {
  const handleStartChanges = () => {
    onEdit?.({ fields });
  };

  return (
    <AttributeWrapper>
      <AttributeHeading>
        {fields.map(({ field, values }) => (
          <div key={`field-${field}`}>
            <Typography variant="bodyMedium" isStrong>
              {field}
            </Typography>

            <AttributeValueList>
              {values.map((value) => (
                <AttributeValuePill key={value}>
                  <AttributeNameText>
                    {formatHTMLStrings(value)}
                  </AttributeNameText>
                </AttributeValuePill>
              ))}
            </AttributeValueList>
          </div>
        ))}
      </AttributeHeading>

      <AttributeRow style={{ padding: spacing(1) }}>
        <AlignedText>
          Operation
          <Image
            width={20}
            height={20}
            alt=""
            src={`/trading-hub/asset/icon-${operation}.svg`}
          />{' '}
          {labels[operation].text}
        </AlignedText>
      </AttributeRow>

      {isEditMode && canEditWeight ? (
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
      ) : (
        <AttributeWeight
          weight={weight || 0}
          field={fields[0].field}
          isEditable={isEditable}
          onDelete={() => onDelete?.({ fields, weight: weight || 0 })}
          onStartChanges={handleStartChanges}
          canEditWeight={canEditWeight}
        />
      )}
    </AttributeWrapper>
  );
};
