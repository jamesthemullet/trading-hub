import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
  type ButtonHTMLAttributes,
  type ElementType,
  forwardRef,
  type Ref,
} from 'react';

import { color } from '../../utils/constants';
import { spacing } from '../../utils/spacing';

const setTheme = ({
  isDisabled,
  isPrimary,
  isTertiary,
}: {
  isDisabled?: boolean;
  isPrimary?: boolean;
  isTertiary?: boolean;
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

const StyledButton = styled.button<ButtonProps>`
  border: solid 1px ${color.lightGrey};
  border-radius: 4px;
  ${({ isDisabled, isPrimary, isTertiary }) =>
    setTheme({ isDisabled, isPrimary, isTertiary })};
  font-size: 16px;
  transition: all 0.1s ease-in;
  transition-property: background-color color border-color;
  text-decoration: none;
  padding: ${spacing(1)} ${spacing(2)};
  height: 40px;
  width: ${({ isInline }) => (isInline ? 'auto' : '100%')};

  &:disabled {
    cursor: default;
    pointer-events: none;
    opacity: 0.7;
  }
`;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isPrimary?: boolean;
  isTertiary?: boolean;
  as?: ElementType;
  isDisabled?: boolean;
  href?: string;
  isInline?: boolean;
  onClick?: () => void;
  theme?: 'primary' | 'secondary' | 'tertiary';
  type?: 'submit' | 'reset' | 'button' | undefined;
};

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
    return (
      <StyledButton
        ref={ref}
        as={as}
        {...(href && { href })}
        isPrimary={theme === 'primary'}
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

Button.displayName = 'Button';
