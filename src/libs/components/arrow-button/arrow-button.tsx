import styled from '@emotion/styled';
import type { ButtonHTMLAttributes, ElementType } from 'react';

import { color } from '@/libs/utils/constants';

export type ArrowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: ElementType;
  isDisabled?: boolean;
  onClick?: () => void;
  direction?: 'down' | 'up';
};

const StyledArrowButton = styled.button<ArrowButtonProps>`
  background: url('/trading-hub/asset/icon-arrow-up.svg');
  background-color: ${color.surface.surfaceContainer};
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  outline: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  width: 40px;
  height: 40px;
  padding: 12px;
  border-radius: 4px;
  ${({ direction }) => direction === 'down' && 'transform: rotate(180deg);'}

  &:hover,
  &:focus {
    margin-top: -2px;
    outline: solid 2px ${color.selectionBox};
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
    background-color: ${color.state.disabled.disabled};
    margin-top: 0;
    outline: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  }

  &:active {
    margin-top: 2px;
  }
`;

export const ArrowButton = ({
  as = 'button',
  isDisabled,
  onClick,
  direction,
  ...rest
}: ArrowButtonProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: _children, ...restWithoutChildren } = rest;
  return (
    <StyledArrowButton
      as={as}
      {...(onClick && !isDisabled && { onClick })}
      {...(isDisabled && { disabled: isDisabled })}
      direction={direction}
      {...restWithoutChildren}
    />
  );
};
