import { useContext, useEffect, useState } from 'react';

import Image from 'next/image';

import { AlphanumericBoostBury, AlphanumericBoostBuryField } from '../../api';
import { FeatureFlagContext } from '../context/feature-flag';
import { Label, Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import {
  AttributeHeading,
  AttributeRow,
  AttributeValueList,
  AttributeValuePill,
  AttributeWrapper,
  Button,
  Buttons,
  RemoveAttributeValuePill,
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
  operation: 'boost' | 'bury' | 'include' | 'exclude';
  weight?: number;
  isEditable?: boolean;
  onChangeAttribute?: (args: AlphanumericBoostBury) => void;
  onDelete?: (args: AlphanumericBoostBury) => void;
}) => {
  const featureFlags = useContext(FeatureFlagContext);

  const [isEditing, setIsEditing] = useState(false);

  const [localFields, setLocalFields] = useState(fields);

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const handleRemoveAttribute = (field: string, value: string) => {
    const newFields = localFields
      .map((f) => {
        if (f.field === field) {
          return {
            ...f,
            values: f.values.filter((v) => v !== value),
          };
        }

        return f;
      })
      .filter((f) => f.values.length > 0);

    setLocalFields(newFields);
  };

  const handleSubmit = ({ weight }: { weight: number }) => {
    setIsEditing(false);

    if (localFields.length === 0) {
      onDelete?.({ fields, weight });
      return;
    }

    onChangeAttribute?.({ fields: localFields, weight });
  };

  return (
    <AttributeWrapper aria-label="Product Attribute">
      <AttributeHeading>
        {localFields.map(({ field, values }) => (
          <div key={`field-${field}`}>
            <Label isStrong>{field}</Label>

            <AttributeValueList>
              {values.map((value) => (
                <AttributeValuePill key={value}>
                  <span>{value}</span>

                  {featureFlags.hasAttributeEdit && isEditing && (
                    <RemoveAttributeValuePill
                      onClick={() => {
                        handleRemoveAttribute(field, value);
                      }}
                      aria-label={`Remove attribute: ${field} ${value}`}
                    >
                      <Image
                        alt=""
                        src={`/trading-hub/asset/icon-remove.svg`}
                        width={16}
                        height={16}
                      />
                    </RemoveAttributeValuePill>
                  )}
                </AttributeValuePill>
              ))}
            </AttributeValueList>
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
          field={fields[0].field}
          isEditable={isEditable}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onChangeSubmit={handleSubmit}
          onDelete={() => onDelete && onDelete({ fields, weight })}
          onCancelChanges={() => setLocalFields(fields)}
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
};
