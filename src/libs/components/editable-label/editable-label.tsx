import { Button, Input, Text, spacing } from '@/libs/components';
import styled from '@emotion/styled';
import Image from 'next/image';
import { useState } from 'react';

const DisplayName = styled.div`
  display: flex;
  align-items: center;
`;

const EditConfirmationButtons = styled.div`
  margin-right: ${spacing(1)};
  display: flex;
  align-items: center;

  button {
    margin-left: ${spacing(1)};
  }
`;

const EditButton = styled(Button)`
  padding: 0;
  border: none;
  background: none;
  width: 20px;
  display: flex;
  margin-left: ${spacing(3)};
  height: 100%;
  align-items: center;

  &:hover {
    background: none;
  }
`;

const StyledInput = styled(Input)`
  font-size: 14px;
  max-height: 2.5rem;
`;

export type EditableLabelProps = {
  displayValue: string;
  onDisplayValueChange: (newValue: string) => void;
};

export const EditableLabel = ({
  displayValue,
  onDisplayValueChange,
}: EditableLabelProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalValue] = useState(displayValue);
  const [value, setValue] = useState(displayValue);

  return (
    <DisplayName>
      {isEditMode ? (
        <>
          <StyledInput
            id={'input'}
            ref={(inputRef) => {
              inputRef?.focus();
            }}
            onChange={(event) => {
              event.stopPropagation();
              setValue(event.target.value);
            }}
            label=""
            value={value}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setIsEditMode(false);
                onDisplayValueChange(value);
              }
              if (event.key === 'Escape') {
                setValue(originalValue);
                setIsEditMode(false);
              }
            }}
            aria-label={`Edit ${displayValue} input field`}
          />
          <EditConfirmationButtons>
            <EditButton
              onClick={() => {
                setIsEditMode(false);
                onDisplayValueChange(value);
              }}
              aria-label={`Save ${displayValue} change`}
            >
              <Image
                width={20}
                height={20}
                src="/trading-hub/asset/icon-tick-in-circle.svg"
                alt=""
              />
            </EditButton>
            <EditButton
              onClick={() => {
                setValue(originalValue);
                setIsEditMode(false);
              }}
              aria-label={`Cancel ${displayValue} change`}
            >
              <Image
                width={20}
                height={20}
                src="/trading-hub/asset/icon-cross-in-circle.svg"
                alt=""
              />
            </EditButton>
          </EditConfirmationButtons>
        </>
      ) : (
        <>
          <Text aria-label={`Label for ${displayValue}`}>{displayValue}</Text>
          <EditButton
            onClick={() => {
              setIsEditMode(true);
            }}
            aria-label={`Edit display name for ${displayValue}`}
          >
            <Image
              width={20}
              height={20}
              src="/trading-hub/asset/icon-edit-pencil.svg"
              alt=""
            />
          </EditButton>
        </>
      )}
    </DisplayName>
  );
};
