import {
  type ButtonHTMLAttributes,
  type ElementType,
  type Ref,
  forwardRef,
} from 'react';

import styled from '@emotion/styled';

import { color } from '../../utils/constants';
import { css } from '@emotion/react';

const setColours = ({
  isDisabled,
  isPrimary,
}: {
  isDisabled?: boolean;
  isPrimary?: boolean;
}) => {
  if (isDisabled) {
    return css`
      color: rgba(142, 142, 142, 1);
      background-color: #f2f2f2;
      border-color: #f2f2f2;
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
        background-color: #c1e2c9;
        border-color: #c1e2c9;
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
      background-color: #f2f2f2;
      border-color: #c1e2c9;
      outline: none;
    }

    &:active {
      background-color: #c1e2c9;
      border-color: #c1e2c9;
    }
  `;
};

const StyledButton = styled.button<ButtonProps>`
  border: solid 1px ${color.lightGrey};
  border-radius: 4px;
  ${({ isDisabled, isPrimary }) => setColours({ isDisabled, isPrimary })};
  font-size: 16px;
  transition: all 0.1s ease-in;
  transition-property: background-color color border-color;
  text-decoration: none;
  padding: 10px 16px;
  width: ${({ isInline }) => (isInline ? 'auto' : '100%')};

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isPrimary?: boolean;
  as?: ElementType;
  isDisabled?: boolean;
  href?: string;
  isInline?: boolean;
  onClick?: () => void;
  theme?: string;
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
