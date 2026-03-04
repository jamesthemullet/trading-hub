import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ElementType,
  forwardRef,
  type ReactNode,
} from 'react';

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
  onClick?:
    | ButtonHTMLAttributes<HTMLButtonElement>['onClick']
    | AnchorHTMLAttributes<HTMLAnchorElement>['onClick'];
  appearance?: 'text' | 'icon' | 'plain';
  isAutoSize?: boolean;
  theme?: 'primary' | 'secondary' | 'tertiary' | 'filled' | 'outlined';
  type?: 'submit' | 'reset' | 'button' | undefined;
  isTextCentred?: boolean;
};

type TextButtonProps = {
  appearance?: 'text';
  children?: ReactNode;
};

type PlainButtonProps = {
  appearance: 'plain';
  children?: ReactNode;
};

type IconButtonProps = {
  appearance: 'icon';
  children?: ReactNode;
  'aria-label': string;
};

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  RawButtonProps &
  (TextButtonProps | PlainButtonProps | IconButtonProps);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      as = 'button',
      isDisabled,
      href,
      onClick,
      appearance = 'text',
      isAutoSize,
      theme,
      type = 'button',
      children,
      icon,
      isInline,
      isTextCentred,
      className,
      ...rest
    },
    ref
  ) => {
    const combinedClassName = [styles.button, 'typographyBodyMedium', className]
      .filter(Boolean)
      .join(' ');

    if (as === 'a' && href) {
      return (
        <Link
          href={href}
          className={combinedClassName}
          data-theme={theme}
          data-is-disabled={isDisabled}
          data-icon={icon}
          data-appearance={appearance}
          data-is-auto-size={isAutoSize}
          data-is-inline={isInline}
          data-is-text-centred={isTextCentred}
          {...(onClick &&
            !isDisabled && {
              onClick:
                onClick as AnchorHTMLAttributes<HTMLAnchorElement>['onClick'],
            })}
          {...(isDisabled && { 'aria-disabled': isDisabled })}
        >
          {children}
        </Link>
      );
    }

    return (
      // The native button has to come from somewhere.
      // eslint-disable-next-line no-restricted-syntax
      <button
        ref={ref}
        className={combinedClassName}
        type={type}
        data-theme={theme}
        data-is-disabled={isDisabled}
        data-icon={icon}
        data-appearance={appearance}
        data-is-auto-size={isAutoSize}
        data-is-inline={isInline}
        data-is-text-centred={isTextCentred}
        {...(onClick && !isDisabled && { onClick })}
        {...(isDisabled && { disabled: isDisabled })}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
