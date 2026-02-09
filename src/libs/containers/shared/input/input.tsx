import type { ChangeEvent, ComponentProps } from 'react';
import { forwardRef, useCallback, useState } from 'react';

import { useMouseFocus } from '@/libs/hooks/utils/use-mouse-focus';

import styles from './input.module.css';

export type InputProps = Omit<
  ComponentProps<'input'>,
  'isEmpty' | 'isMouseFocus' | 'ref'
> & {
  id: string;
  label: string;
  isLabelHidden?: boolean;
  as?: never;
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
