import type { ChangeEvent, ComponentProps } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useMouseFocus } from '@/libs/hooks/use-mouse-focus';
import { Label } from '@onyx/ui/components/core/label';
import {
  type MessagingProps,
  Messaging,
} from '@onyx/ui/components/core/messaging';
import {
  type TooltipProps,
  Tooltip,
  tooltipAriaLabelledBy,
} from '@onyx/ui/components/core/tooltip';
import { Typography } from '@onyx/ui/components/core/typography';
import {
  formActiveStyles,
  formDefaultStyles,
  sizing,
  spacing,
} from '@onyx/ui/components/core-lib';
import { colourDictionary } from '../utils/constants';

const padding = 1;

const StyledInput = styled.input<{
  isMouseFocus?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
}>`
  ${({ theme }) => formDefaultStyles({ theme, padding })}
  height: ${sizing(6)};
  width: ${sizing('100%')};
  ${({ isMouseFocus, isEmpty, theme }) =>
    (isMouseFocus || !isEmpty) &&
    css`
      ${formActiveStyles(theme)}
      padding-left: calc(${spacing(padding)} - 1px);
    `};
  ${({ isError }) =>
    isError &&
    css`
      border-color: ${colourDictionary.red[300]};
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

const StyledLabel = styled(Label)<{ isHidden: boolean }>`
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
    variant: MessagingProps['variant'];
    text: string;
  };
  isRequired?: boolean;
  tooltip?: Omit<TooltipProps, 'id'> | false;
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
      tooltip = false,
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
          {tooltip && <Tooltip {...tooltip} id={id} />}
          <StyledLabel
            htmlFor={id}
            isHidden={isLabelHidden}
            isDisabled={rest.disabled}
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
          {...(tooltip && tooltipAriaLabelledBy(id))}
          {...(message && { isError })}
          {...mouseFocusProps}
          {...rest}
          onChange={handleChange}
        />

        {isError && (
          <StyledError>
            <Messaging variant="inlineError">{message.text}</Messaging>
          </StyledError>
        )}

        {!!maxLength && (
          <CharacterLimitWrapper>
            <Typography as="p" variant="textSmall">
              {remainingCharactersMessage}
            </Typography>
          </CharacterLimitWrapper>
        )}
      </>
    );
  }
);
