import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { ChangeEvent, ComponentProps } from 'react';
import { forwardRef, useCallback, useState } from 'react';

import { useMouseFocus } from '@/libs/hooks/utils/use-mouse-focus';
import {
  formActiveStyles,
  formDefaultStyles,
} from '@/libs/utils/shared.styles';
import { sizing } from '@/libs/utils/sizing';
import { spacing } from '@/libs/utils/spacing';

import styles from './input.module.css';

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
`;

const StyledLabelWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

const StyledLabel = styled.label`
  display: inline-block;
  margin-bottom: ${spacing(0.5)};
`;

export type InputProps = Omit<
  ComponentProps<'input'>,
  'isEmpty' | 'isMouseFocus' | 'ref'
> & {
  id: string;
  label: string;
  isLabelHidden?: boolean;
  as?: never;
};

export const InputDeprecated = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      label,
      isLabelHidden = false,
      onChange,
      onBlur,
      onMouseDown,
      ...rest
    }: InputProps,
    ref
  ) => {
    const mouseFocusProps = useMouseFocus({ onBlur, onMouseDown });
    const [isEmpty, setIsEmpty] = useState(true);
    const [inputVal, setInputVal] = useState('');

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setIsEmpty(event.target.value.length === 0);
        setInputVal(event.target.value || /* istanbul ignore next */ '');
        onChange?.(event);
      },
      [onChange]
    );

    return (
      <>
        {!isLabelHidden && (
          <StyledLabelWrapper>
            <StyledLabel htmlFor={id} {...mouseFocusProps}>
              {label}
            </StyledLabel>
          </StyledLabelWrapper>
        )}
        <StyledInput
          ref={ref}
          name={name}
          id={id}
          isEmpty={isEmpty}
          value={inputVal}
          aria-label={isLabelHidden ? label : undefined}
          {...mouseFocusProps}
          {...rest}
          onChange={handleChange}
        />
      </>
    );
  }
);

InputDeprecated.displayName = 'InputDeprecated';

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
      ...rest
    }: InputProps,
    ref
  ) => {
    const { isMouseFocus, ...mouseFocusProps } = useMouseFocus({
      onBlur,
      onMouseDown,
    });
    const [inputVal, setInputVal] = useState('');
    const isEmpty = inputVal.length === 0;

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setInputVal(event.target.value || /* istanbul ignore next */ '');
        onChange?.(event);
      },
      [onChange]
    );

    return (
      <>
        {!isLabelHidden && (
          <div className={styles.labelWrapper}>
            <label className={styles.label} htmlFor={id} {...mouseFocusProps}>
              {label}
            </label>
          </div>
        )}
        <input
          className={styles.input}
          ref={ref}
          name={name}
          id={id}
          value={inputVal}
          aria-label={isLabelHidden ? label : undefined}
          data-is-mouse-focus={isMouseFocus}
          data-is-empty={isEmpty}
          {...mouseFocusProps}
          {...rest}
          onChange={handleChange}
        />
      </>
    );
  }
);

Input.displayName = 'Input';
