import styled from '@emotion/styled';
import { FormEvent, useState } from 'react';

import Image from 'next/image';

import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { AttributeRow } from './ruleset-attributes.styles';

const Input = styled.input`
  min-width: 60px;
`;

const Buttons = styled.div`
  display: flex;
`;
const Button = styled.button`
  border: none;
  background: none;
`;
export const ErrorText = styled(Text)`
  color: ${color.errorRed};
`;

export const AttributeWeight = ({
  isEditable,
  onChangeAttribute,
  onDelete,
  weight,
}: {
  isEditable?: boolean;
  onChangeAttribute?: (args: { newWeight: number }) => void;
  onDelete?: () => void;
  weight: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(weight);
  const [error, setError] = useState('');

  const onSubmit = () => {
    onChangeAttribute && onChangeAttribute({ newWeight: value });
    setIsEditing(false);
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
            <Button onClick={() => setIsEditing(true)} aria-label="Edit weight">
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
              <Button onClick={onSubmit} aria-label="Save weight change">
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
                  }
                }
                aria-label="Cancel weight change"
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
