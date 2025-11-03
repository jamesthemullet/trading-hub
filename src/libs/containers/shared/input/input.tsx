import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { ChangeEvent, ComponentProps } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { FormLabel } from '@/libs/components/form-label/form-label';
import { Text } from '@/libs/components/typography/typography.styles';
import { useMouseFocus } from '@/libs/hooks/utils/use-mouse-focus';
import { color } from '@/libs/utils/constants';
import {
  formActiveStyles,
  formDefaultStyles,
} from '@/libs/utils/shared.styles';
import { sizing } from '@/libs/utils/sizing';
import { spacing } from '@/libs/utils/spacing';

const padding = 1;

const StyledInput = styled.input<{
  isMouseFocus?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
}>`
  ${() => formDefaultStyles({ padding })}
  height: ${sizing(6)};
  width: ${sizing('100%')};
  ${({ isMouseFocus, isEmpty }) =>
    (isMouseFocus || !isEmpty) &&
    css`
      ${formActiveStyles()}
      padding-left: calc(${spacing(padding)} - 1px);
    `};
  ${({ isError }) =>
    isError &&
    css`
      border-color: ${color.state.error.error};
      border-width: 2px;
    `};
`;

const StyledError = styled.div`
  margin-top: ${spacing(2)};
`;

const StyledLabelWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

const CharacterLimitWrapper = styled.div`
  margin-top: ${spacing(1)};
`;

const StyledLabel = styled(FormLabel)<{ isHidden: boolean }>`
  ${({ isHidden }) =>
    !isHidden &&
    css`
      display: inline-block;
      margin-bottom: ${spacing(0.5)};
    `}
`;

export type InputProps = Omit<
  ComponentProps<'input'>,
  'isEmpty' | 'isMouseFocus' | 'ref'
> & {
  id: string;
  label: string;
  isLabelHidden?: boolean;
  as?: never;
  defaultValue?: string;
  message?: {
    variant: 'success' | 'info' | 'error' | 'inlineError';
    text: string;
  };
  isRequired?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      label,
      isLabelHidden = false,
      onChange,
      onBlur,
      onMouseDown,
      maxLength,
      message,
      defaultValue,
      isRequired = false,
      ...rest
    }: InputProps,
    ref
  ) => {
    const mouseFocusProps = useMouseFocus({ onBlur, onMouseDown });
    const [isEmpty, setIsEmpty] = useState(true);
    const [inputVal, setInputVal] = useState('');

    useEffect(() => {
      if (defaultValue !== undefined) {
        setInputVal(defaultValue);
      }
    }, [defaultValue]);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setIsEmpty(event.target.value.length === 0);
        setInputVal(event.target.value || /* istanbul ignore next */ '');
        onChange?.(event);
      },
      [onChange]
    );

    const isError =
      message &&
      !!message.text &&
      (message.variant === 'error' || message.variant === 'inlineError');

    const remainingCharacters = maxLength && maxLength - inputVal.length;

    const remainingCharactersMessage = `${remainingCharacters} ${
      remainingCharacters === 1 ? 'Character' : 'Characters'
    } left`;

    return (
      <>
        <StyledLabelWrapper>
          <StyledLabel
            htmlFor={id}
            isHidden={isLabelHidden}
            isRequired={isRequired}
            {...mouseFocusProps}
          >
            {label}
          </StyledLabel>
        </StyledLabelWrapper>
        <StyledInput
          ref={ref}
          name={name}
          id={id}
          isEmpty={isEmpty}
          maxLength={maxLength}
          value={inputVal}
          required={isRequired}
          {...(message && { isError })}
          {...mouseFocusProps}
          {...rest}
          onChange={handleChange}
        />

        {isError && (
          <StyledError>
            <Text style={{ color: color.state.error.error }}>
              {message.text}
            </Text>
          </StyledError>
        )}

        {!!maxLength && (
          <CharacterLimitWrapper>
            <Text>{remainingCharactersMessage}</Text>
          </CharacterLimitWrapper>
        )}
      </>
    );
  }
);

Input.displayName = 'Input';
