import type { ComponentProps } from 'react';
import { useId } from 'react';

import { Typography } from '../typography/typography';
import styles from './checkbox.module.css';

type InputProps = Omit<
  ComponentProps<'input'>,
  'isEmpty' | 'isMouseFocus' | 'ref'
> & {
  label: string;
  onChange: () => void;
  showLabel?: boolean;
};

export const Checkbox = ({ label, showLabel, ...rest }: InputProps) => {
  const id = useId();

  return showLabel ? (
    <label className={styles.checkboxLabel} htmlFor={id}>
      <input
        className={styles.checkbox}
        type="checkbox"
        {...rest}
        id={id}
        aria-label={label}
      />
      <Typography variant="bodySmall">{label}</Typography>
    </label>
  ) : (
    <input
      className={styles.checkbox}
      type="checkbox"
      {...rest}
      aria-label={label}
    />
  );
};
