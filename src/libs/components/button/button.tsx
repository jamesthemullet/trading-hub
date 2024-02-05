import {
  type ButtonHTMLAttributes,
  type ElementType,
  type Ref,
  forwardRef,
} from 'react';

import styled from '@emotion/styled';

import { color, colourDictionary } from '../utils/constants';

type ButtonProps = {
  isPrimary?: boolean;
};

const StyledButton = styled.button<ButtonProps>`
  border: solid 1px ${color.lightGrey};
  border-radius: 4px;
  background-color: ${({ isPrimary }) =>
    isPrimary ? colourDictionary.black : colourDictionary.white};
  font-size: 16px;
  color: ${({ isPrimary }) =>
    isPrimary ? colourDictionary.white : colourDictionary.black};
  transition: background-color 0.1s ease-in;
  text-decoration: none;
  padding: 10px 16px;
  width: 100%;

  &:hover {
    background-color: ${({ isPrimary }) =>
      isPrimary ? color.buttonPrimaryHover : color.backgroundGrey};
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;

    &:hover {
      background-color: ${({ isPrimary }) =>
        isPrimary ? colourDictionary.black : colourDictionary.white};
    }
  }
`;

export type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: ElementType;
  isDisabled?: boolean;
  href?: string;
  onClick?: () => void;
  theme?: string;
  type?: 'submit' | 'reset' | 'button' | undefined;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
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
    }: Props,
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
        type={type}
        {...rest}
      >
        {children}
      </StyledButton>
    );
  }
);
