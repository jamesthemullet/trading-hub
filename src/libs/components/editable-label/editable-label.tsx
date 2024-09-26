import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { Button, Input, spacing, Text } from '@/libs/components';

import Image from 'next/image';

import { color } from '../utils/constants';

const DisplayName = styled.div`
  display: flex;
  align-items: center;
  width: max-content;
  flex-wrap: wrap;
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

const InputContainer = styled.div`
  position: relative;
`;

const StyledInput = styled(Input)<{ showErrorState: boolean }>`
  font-size: 14px;
  max-height: 2.5rem;
  border-radius: 4px;
  padding-right: 30px;

  ${({ showErrorState }) =>
    showErrorState && `border: 1px solid ${color.saleRed}`};
`;

const StyledIcon = styled(Image)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
`;

const StyledError = styled(Text)`
  color: ${color.saleRed};
  margin-top: ${spacing(0.5)};
`;

export type EditableLabelProps = {
  displayValue: string;
  onDisplayValueChange: (newValue: string) => void;
  shouldOpenFromParent?: boolean;
  canCancelEdit?: boolean;
  error?: string | null;
  disallowedValues?: string[];
};

export const EditableLabel = ({
  displayValue,
  onDisplayValueChange,
  shouldOpenFromParent,
  canCancelEdit,
  error,
  disallowedValues,
}: EditableLabelProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalValue] = useState(displayValue);
  const [value, setValue] = useState(displayValue);
  const [showErrorState, setShowErrorState] = useState(false);
  const [disallowedErrorMessage, setDisallowedErrorMessage] = useState('');

  useEffect(() => {
    if (shouldOpenFromParent) {
      setIsEditMode(true);
      setValue(displayValue);
    } else {
      setIsEditMode(false);
    }
  }, [shouldOpenFromParent, displayValue]);

  useEffect(() => {
    if (error) {
      setShowErrorState(true);
      setIsEditMode(true);
    } else {
      setShowErrorState(false);
    }
  }, [error, disallowedValues]);

  return (
    <DisplayName>
      {isEditMode ? (
        <>
          <InputContainer>
            <StyledInput
              id={'input'}
              ref={(inputRef) => {
                inputRef?.focus();
              }}
              onChange={(event) => {
                event.stopPropagation();
                if (
                  value &&
                  (event.target.value === '' ||
                    disallowedValues?.includes(event.target.value))
                ) {
                  setShowErrorState(true);
                  setDisallowedErrorMessage(
                    `${event.target.value} is not a unique value`
                  );
                } else {
                  setShowErrorState(false);
                  setDisallowedErrorMessage('');
                }
                setValue(event.target.value);
              }}
              label=""
              value={value}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !showErrorState) {
                  setIsEditMode(false);
                  onDisplayValueChange(value);
                }
                if (event.key === 'Escape' && canCancelEdit) {
                  setValue(originalValue);
                  setIsEditMode(false);
                }
              }}
              aria-label={`Edit ${displayValue} input field`}
              showErrorState={showErrorState}
            />
            {showErrorState && (
              <StyledIcon
                width={20}
                height={20}
                src="/trading-hub/asset/icon-warning.svg"
                alt=""
              />
            )}
          </InputContainer>
          <EditConfirmationButtons>
            <EditButton
              onClick={() => {
                onDisplayValueChange(value);
                setIsEditMode(false);
              }}
              aria-label={`Save ${displayValue} change`}
              isDisabled={showErrorState}
            >
              <Image
                width={20}
                height={20}
                src="/trading-hub/asset/icon-tick-in-circle.svg"
                alt=""
              />
            </EditButton>
            {canCancelEdit && (
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
            )}
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
      {showErrorState && !error && (
        <StyledError>{disallowedErrorMessage}</StyledError>
      )}
    </DisplayName>
  );
};
