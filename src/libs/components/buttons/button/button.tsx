import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
  type ButtonHTMLAttributes,
  type ElementType,
  forwardRef,
  type Ref,
} from 'react';

import Link from 'next/link';

import { color } from '../../utils/constants';
import { sizing } from '../../utils/sizing';
import { spacing } from '../../utils/spacing';

const setTheme = ({
  isDisabled,
  isPrimary,
  isTertiary,
  isFilled,
  isOutlined,
}: {
  isDisabled?: boolean;
  isPrimary?: boolean;
  isTertiary?: boolean;
  isFilled?: boolean;
  isOutlined?: boolean;
}) => {
  if (isTertiary) {
    return css`
      color: rgba(29, 29, 27, 1);
      background: ${isDisabled ? color.backgroundGrey : '#fff'};
      border-color: ${color.accessibilityGrey};
      font-weight: 600;
      border-radius: 20px;

      &:hover,
      &:focus {
        background-color: ${color.backgroundGrey};
        border-color: ${isDisabled
          ? color.accessibilityGrey
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
      background-color: ${color.backgroundGrey};
      border-color: ${color.backgroundGrey};
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
  if (isFilled) {
    return css`
      text-align: left;
      border: ${color.accent.primary.primary} solid 1px;
      background: ${color.accent.primary.primary};
      color: ${color.accent.primary.onPrimary};

      &:hover {
        background-color: #10604b;
      }
      &:focus {
        background-color: #226c59;
      }
    `;
  }
  if (isOutlined) {
    return css`
      text-align: left;
      border: ${color.accent.primary.primary} solid 1px;
      background: #fff;
      color: ${color.accent.primary.primary};

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
      background-color: ${color.backgroundGrey};
      border-color: ${color.lightGreen};
    }

    &:active {
      background-color: ${color.lightGreen};
      border-color: ${color.lightGreen};
    }
  `;
};

const setIcon = ({ icon }: { icon: string }) => css`
  &::before {
    content: '';
    width: 10px;
    height: 10px;
    background-image: url(${`/trading-hub/asset/icon-${icon}.svg`});
    background-repeat: no-repeat;
    background-size: contain;
    display: inline-block;
    margin-right: ${spacing(1)};
  }
`;

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
  ${({ isDisabled, isPrimary, isTertiary, isOutlined, isFilled }) =>
    setTheme({ isDisabled, isPrimary, isTertiary, isOutlined, isFilled })};
  ${({ icon }) => icon && setIcon({ icon })};
  ${({ isTextCentred }) => isTextCentred && 'text-align: center;'}
  width: ${({ isInline }) => (isInline ? 'auto' : '100%')};
`;

const StyledLink = styled(Link, {
  shouldForwardProp: (prop) =>
    ![
      'isPrimary',
      'isTertiary',
      'isFilled',
      'isOutlined',
      'isDisabled',
      'iconPosition',
      'isInline',
    ].includes(prop),
})<RawButtonProps>`
  ${sharedButtonStyles};
  ${({ isDisabled, isPrimary, isTertiary, isOutlined, isFilled }) =>
    setTheme({ isDisabled, isPrimary, isTertiary, isOutlined, isFilled })};
  ${({ icon }) => icon && setIcon({ icon })};
  width: ${({ isInline }) => (isInline ? 'auto' : '100%')};
`;

type Icon = 'plus-simple-green' | 'plus-simple-white';

export type RawButtonProps = {
  isPrimary?: boolean;
  isTertiary?: boolean;
  isFilled?: boolean;
  isOutlined?: boolean;
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
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  RawButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
          isTertiary={theme === 'tertiary'}
          isFilled={theme === 'filled'}
          isOutlined={theme === 'outlined'}
          {...(onClick && !isDisabled && { onClick })}
          {...(isDisabled && { 'aria-disabled': isDisabled })}
          isDisabled={isDisabled}
          isInline={rest.isInline}
          icon={rest.icon}
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
        isTertiary={theme === 'tertiary'}
        isFilled={theme === 'filled'}
        isOutlined={theme === 'outlined'}
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

Button.displayName = 'Button';
