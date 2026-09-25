import type { ChangeEvent, ComponentProps } from 'react';
import { forwardRef, useCallback, useState } from 'react';

import { Typography } from '@/libs/components/typography/typography';
import { useMouseFocus } from '@/libs/hooks/utils/use-mouse-focus';

import styles from './input.module.css';

type LabelVariant = 'labelLarge' | 'labelMedium' | 'labelSmall';

export type InputProps = Omit<
  ComponentProps<'input'>,
  'isEmpty' | 'isMouseFocus' | 'ref' | 'size'
> & {
  id: string;
  label: string;
  isLabelHidden?: boolean;
  size?: 'default' | 'small' | 'medium';
  labelVariant?: LabelVariant;
  isInline?: boolean;
  as?: never;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      label,
      isLabelHidden = false,
      size = 'default',
      labelVariant = 'labelMedium',
      isInline = false,
      onChange,
      onBlur,
      onMouseDown,
      className,
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
        setInputVal(event.target.value || '');
        onChange?.(event);
      },
      [onChange]
    );

    return (
      <>
        {!isLabelHidden && (
          <div className={styles.labelWrapper}>
            <Typography
              as="label"
              variant={labelVariant}
              className={styles.label}
              htmlFor={id}
              {...mouseFocusProps}
            >
              {label}
            </Typography>
          </div>
        )}
        <input
          className={[styles.input, className].filter(Boolean).join(' ')}
          ref={ref}
          name={name}
          id={id}
          value={inputVal}
          aria-label={isLabelHidden ? label : undefined}
          data-is-mouse-focus={isMouseFocus}
          data-is-empty={isEmpty}
          data-size={size}
          data-inline={isInline}
          {...mouseFocusProps}
          {...rest}
          onChange={handleChange}
        />
      </>
    );
  }
);

Input.displayName = 'Input';
