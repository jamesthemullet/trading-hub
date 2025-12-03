import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { ButtonDeprecated, Text } from '@/libs/components';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import Image from 'next/image';

import { Input } from '../input/input';

const DisplayName = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: ${spacing(2)};
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
`;

const EditConfirmationButtons = styled.div`
  display: flex;
  align-items: center;

  button {
    margin-left: ${spacing(1)};
  }
`;

const EditButton = styled(ButtonDeprecated)`
  padding: 0;
  border: none;
  background: none;
  width: 20px;
  display: flex;
  margin-left: ${spacing(1)};
  height: 100%;
  align-items: center;

  &:hover {
    background: none;
  }
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled(Input)<{ showErrorState: boolean }>`
  font-size: 14px;
  max-height: 2.5rem;
  border-radius: 4px;
  padding-right: 30px;

  ${({ showErrorState }) =>
    showErrorState && `border: 1px solid ${color.state.error.error}`};
`;

const StyledText = styled(Text)`
  margin-left: ${spacing(0.5)};
`;

const StyledIcon = styled(Image)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
`;

const StyledError = styled(Text)`
  color: ${color.state.error.error};
  margin-top: ${spacing(0.5)};
`;

type EditableLabelProps = {
  displayValue: string;
  onDisplayValueChange: (newValue: string) => void;
  setError: (message: string) => void;
  showErrorState: boolean;
  showEditState?: boolean;
  handleUpdatedValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
  canCancelEdit?: boolean;
  onCancel?: () => void;
  disallowedValues?: string[];
  disallowedErrorMessage?: string;
  writeEnabled?: boolean;
};

export const EditableLabel = ({
  displayValue,
  onDisplayValueChange,
  setError,
  showErrorState,
  showEditState,
  handleUpdatedValue,
  canCancelEdit,
  onCancel,
  disallowedErrorMessage,
  writeEnabled = true,
}: EditableLabelProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalValue] = useState(displayValue);
  const [value, setValue] = useState(displayValue);

  useEffect(() => {
    if (showErrorState || showEditState) {
      setIsEditMode(true);
    }
  }, [showErrorState, showEditState, displayValue]);

  return (
    <DisplayName>
      <NameContainer>
        {isEditMode ? (
          <>
            <InputContainer>
              <StyledInput
                id="input"
                ref={(inputRef) => {
                  inputRef?.focus();
                }}
                onChange={(event) => {
                  handleUpdatedValue(event);
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
                    // istanbul ignore else
                    if (onCancel) onCancel();
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
                    setError('');
                    // istanbul ignore else
                    if (onCancel) onCancel();
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
            <StyledText data-testid={`Label for ${displayValue}`}>
              {displayValue}
            </StyledText>

            {writeEnabled && (
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
            )}
          </>
        )}
      </NameContainer>
      {showErrorState && <StyledError>{disallowedErrorMessage}</StyledError>}
    </DisplayName>
  );
};
