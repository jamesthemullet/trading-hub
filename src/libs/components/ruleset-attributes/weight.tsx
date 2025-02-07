import styled from '@emotion/styled';
import { FormEvent, useState } from 'react';

import Image from 'next/image';

import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { AttributeRow, Button, Buttons } from './ruleset-attributes.styles';

const Input = styled.input`
  min-width: 60px;
`;

const ErrorText = styled(Text)`
  color: ${color.errorRed};
`;

export const AttributeWeight = ({
  weight,
  field,
  isEditable,
  isEditing,
  setIsEditing,
  onChangeSubmit,
  onDelete,
  onCancelChanges,
}: {
  weight: number;
  field?: string;
  isEditable?: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onChangeSubmit: (args: { weight: number }) => void;
  onDelete?: () => void;
  onCancelChanges?: () => void;
}) => {
  const [value, setValue] = useState(weight);
  const [error, setError] = useState('');

  const onSubmit = () => {
    onChangeSubmit({ weight: value });
  };

  return (
    <>
      <AttributeRow>
        {isEditing ? (
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <Text as="label" aria-label="Edit value">
              Strength{' '}
              <Input
                value={value ? value : ''}
                onChange={(e) => {
                  const { value } = e.target;
                  const weight = parseInt(value || '0');
                  if (weight < 1 || weight > 100) {
                    setError('Weight must be between 1 and 100');
                  } else {
                    setError('');
                  }
                  /* istanbul ignore next */
                  setValue(parseInt(value || '0'));
                }}
                type="number"
                step={1}
                min={0}
                max={100}
              />{' '}
              %
            </Text>
          </form>
        ) : (
          <Text>Strength {Math.round(isEditable ? value : weight)}%</Text>
        )}
      </AttributeRow>
      {isEditable && !isEditing && (
        <AttributeRow>
          <Buttons>
            <Button
              onClick={() => setIsEditing(true)}
              aria-label={`Edit attribute ${field}`}
            >
              <Image
                width={20}
                height={20}
                src="/trading-hub/asset/icon-edit.svg"
                alt=""
              />
            </Button>
            <Button onClick={onDelete} aria-label="Delete attribute">
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
      {isEditable && isEditing && (
        <AttributeRow>
          {error ? (
            <ErrorText>{error}</ErrorText>
          ) : (
            <Buttons style={{ justifyContent: 'end' }}>
              <Button
                onClick={onSubmit}
                aria-label={`Save attribute ${field} change`}
              >
                <Image
                  width={20}
                  height={20}
                  src="/trading-hub/asset/icon-tick-in-circle.svg"
                  alt=""
                />
              </Button>
              <Button
                onClick={
                  /* istanbul ignore next */
                  () => {
                    setValue(weight);
                    setIsEditing(false);
                    onCancelChanges?.();
                  }
                }
                aria-label={`Cancel attribute ${field} change`}
              >
                <Image
                  width={20}
                  height={20}
                  src="/trading-hub/asset/icon-cross-in-circle.svg"
                  alt=""
                />
              </Button>
            </Buttons>
          )}
        </AttributeRow>
      )}
    </>
  );
};
