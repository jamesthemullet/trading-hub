import type { ButtonHTMLAttributes, ElementType } from 'react';

import Link from 'next/link';

import styles from './button.module.css';

type Icon = 'plus-simple-green' | 'plus-simple-white';

type RawButtonProps = {
  isPrimary?: boolean;
  isSecondary?: boolean;
  isTertiary?: boolean;
  as?: ElementType;
  isDisabled?: boolean;
  href?: string;
  isInline?: boolean;
  icon?: Icon;
  onClick?: () => void;
  theme?: 'primary' | 'secondary' | 'tertiary' | 'filled' | 'outlined';
  type?: 'submit' | 'reset' | 'button' | undefined;
  isTextCentred?: boolean;
};
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & RawButtonProps;

export const Button = ({
  as = 'button',
  isDisabled,
  href,
  onClick,
  theme,
  type = 'button',
  children,
  icon,
  isInline,
  isTextCentred,
  ...rest
}: ButtonProps) => {
  const className = `${styles.button} typographyBodyMedium`;

  if (as === 'a' && href) {
    return (
      <Link
        href={href}
        className={className}
        data-theme={theme}
        data-is-disabled={isDisabled}
        data-icon={icon}
        data-is-inline={isInline}
        data-is-text-centred={isTextCentred}
        {...(onClick && !isDisabled && { onClick })}
        {...(isDisabled && { 'aria-disabled': isDisabled })}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={className}
      type={type}
      data-theme={theme}
      data-is-disabled={isDisabled}
      data-icon={icon}
      data-is-inline={isInline}
      data-is-text-centred={isTextCentred}
      {...(onClick && !isDisabled && { onClick })}
      {...(isDisabled && { disabled: isDisabled })}
      {...rest}
    >
      {children}
    </button>
  );
};
