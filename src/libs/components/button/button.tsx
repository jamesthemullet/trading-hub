import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { ButtonHTMLAttributes, ElementType, Ref } from 'react';
import { forwardRef } from 'react';

import { color } from '@/libs/utils/constants';
import { sizing } from '@/libs/utils/sizing';
import { spacing } from '@/libs/utils/spacing';

import Link from 'next/link';

import { fonts } from '../typography/typography.styles';
import styles from './button.module.css';

const setTheme = ({
  isDisabled,
  isPrimary,
  isSecondary,
  isTertiary,
}: {
  isDisabled?: boolean;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isTertiary?: boolean;
}) => {
  if (isTertiary) {
    return css`
      color: rgba(29, 29, 27, 1);
      border-color: ${color.surface.onSurfaceVariant};
      font-weight: 600;
      border-radius: 20px;

      &:hover,
      &:focus {
        background-color: ${color.accent.secondary.secondaryContainer};
        border-color: ${isDisabled
          ? color.surface.onSurfaceVariant
          : '#C0E2C9'}; // colour in figma but not in design system
      }

      &:active {
        background-color: #c0e2c9;
        border-color: #c0e2c9;
      }
    `;
  }
  if (isDisabled) {
    return css`
      color: rgba(142, 142, 142, 1);
      background-color: ${color.accent.secondary.secondaryContainer};
      border-color: ${color.accent.secondary.secondaryContainer};
    `;
  }
  if (isPrimary) {
    return css`
      color: #fff;
      background-color: #1d1d1b;
      border-color: #1d1d1b;

      &:hover,
      &:active {
        color: rgba(29, 29, 27, 1);
        background-color: ${color.lightGreen};
        border-color: ${color.lightGreen};
      }

      &:active {
        background-color: #e1ece3;
        border-color: #e1ece3;
      }
    `;
  }
  if (isSecondary) {
    return css`
      color: #1d1d1b;
      background: ${color.accent.primary.onPrimary};
      border: #8c8c8c solid 1px;
      text-align: center;
      font-family: ${fonts.semiBold};

      &:hover {
        background-color: #f0f5f4;
      }
      &:focus {
        background-color: #dee9e6;
      }
    `;
  }

  return css`
    color: rgba(29, 29, 27, 1);
    background: #fff;
    border-color: #e5e5e5;

    &:hover,
    &:focus {
      background-color: ${color.accent.secondary.secondaryContainer};
      border-color: ${color.lightGreen};
    }

    &:active {
      background-color: ${color.lightGreen};
      border-color: ${color.lightGreen};
    }
  `;
};

const sharedButtonStyles = css`
  border: solid 1px ${color.lightGrey};
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.1s ease-in;
  transition-property: background-color color border-color;
  text-decoration: none;
  padding: ${spacing(1)} ${spacing(2)};
  height: ${sizing(5.5)};
  &:disabled {
    cursor: default;
    pointer-events: none;
    opacity: 0.7;
  }
`;

const StyledButton = styled.button<ButtonProps>`
  ${sharedButtonStyles};
  ${({ isDisabled, isPrimary, isSecondary, isTertiary }) =>
    setTheme({
      isDisabled,
      isPrimary,
      isSecondary,
      isTertiary,
    })};
`;

const StyledLink = styled(Link, {
  shouldForwardProp: (prop) =>
    ![
      'isPrimary',
      'isSecondary',
      'isTertiary',
      'isFilled',
      'isDisabled',
      'iconPosition',
    ].includes(prop),
})<RawButtonProps>`
  ${sharedButtonStyles};
  ${({ isDisabled, isPrimary, isSecondary, isTertiary }) =>
    setTheme({
      isDisabled,
      isPrimary,
      isSecondary,
      isTertiary,
    })};
`;

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

export const ButtonDeprecated = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      as = 'button',
      isDisabled,
      href,
      onClick,
      theme,
      type = 'button',
      children,
      ...rest
    }: ButtonProps,
    ref: Ref<HTMLButtonElement>
  ) => {
    if (as === 'a' && href) {
      return (
        <StyledLink
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          isPrimary={theme === 'primary'}
          isSecondary={theme === 'secondary'}
          isTertiary={theme === 'tertiary'}
          {...(isDisabled && { 'aria-disabled': isDisabled })}
          isDisabled={isDisabled}
        >
          {children}
        </StyledLink>
      );
    }

    return (
      <StyledButton
        ref={ref}
        as={as}
        isPrimary={theme === 'primary'}
        isSecondary={theme === 'secondary'}
        isTertiary={theme === 'tertiary'}
        {...(onClick && !isDisabled && { onClick })}
        {...(isDisabled && { disabled: isDisabled })}
        isDisabled={isDisabled}
        type={type}
        {...rest}
      >
        {children}
      </StyledButton>
    );
  }
);

ButtonDeprecated.displayName = 'ButtonDeprecated';

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
