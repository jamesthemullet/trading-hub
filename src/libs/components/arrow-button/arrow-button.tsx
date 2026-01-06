import type { ButtonHTMLAttributes } from 'react';

import { Button } from '../button/button';
import styles from './arrow-button.module.css';

type ArrowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isDisabled?: boolean;
  onClick?: () => void;
  direction?: 'down' | 'up';
  label?: string;
};

export const ArrowButton = ({
  isDisabled,
  onClick,
  direction,
  label,
}: ArrowButtonProps) => {
  return (
    <Button
      className={styles.arrowButton}
      data-direction={direction}
      {...(onClick && !isDisabled && { onClick })}
      {...(isDisabled && { disabled: isDisabled })}
      aria-label={label}
    />
  );
};
