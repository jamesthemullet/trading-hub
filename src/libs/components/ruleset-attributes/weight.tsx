import { useState } from 'react';
import { AttributeRow } from './ruleset-attributes.styles';
import { Text } from '../typography/typography.styles';
import styled from '@emotion/styled';

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

export const AttributeWeight = ({
  isEditable,
  weight,
}: {
  isEditable?: boolean;
  weight: number | undefined;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(weight);

  return (
    <>
      <AttributeRow>
        {isEditing ? (
          <form
            onSubmit={
              /* istanbul ignore next */
              (e) => {
                e.preventDefault();
                setIsEditing(false);
              }
            }
          >
            <Text as="label" aria-label="Edit value">
              Strength{' '}
              <Input
                value={value ? value * 100 : ''}
                onChange={(e) => {
                  const { value } = e.target;
                  /* istanbul ignore next */
                  setValue(parseInt(value || '0') / 100);
                }}
                type="number"
                min="0"
                max="100"
              />{' '}
              %
            </Text>
          </form>
        ) : (
          <Text>Strength {value ? (value * 100).toFixed(1) : 0}%</Text>
        )}
      </AttributeRow>
      {isEditable && !isEditing && (
        <AttributeRow>
          <Buttons>
            <Button onClick={() => setIsEditing(true)} aria-label="Edit weight">
              <img src="/trading-hub/asset/icon-edit.svg" alt="" />
            </Button>
            <Button aria-label="Delete attribute">
              <img src="/trading-hub/asset/icon-delete.svg" alt="" />
            </Button>
          </Buttons>
        </AttributeRow>
      )}
      {isEditable && isEditing && (
        <AttributeRow>
          <Buttons style={{ justifyContent: 'end' }}>
            <Button
              onClick={() => setIsEditing(false)}
              aria-label="Save weight change"
            >
              <img src="/trading-hub/asset/icon-tick-in-circle.svg" alt="" />
            </Button>
            <Button
              onClick={
                /* istanbul ignore next */
                () => setIsEditing(false)
              }
              aria-label="Cancel weight change"
            >
              <img src="/trading-hub/asset/icon-cross-in-circle.svg" alt="" />
            </Button>
          </Buttons>
        </AttributeRow>
      )}
    </>
  );
};
