import styled from '@emotion/styled';
import { ButtonHTMLAttributes, ElementType } from 'react';
import { color } from '../../utils/constants';

export type ArrowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: ElementType;
  isDisabled?: boolean;
  onClick?: () => void;
  direction?: 'down' | 'up';
};

export const ArrowButton = ({
  as = 'button',
  isDisabled,
  onClick,
  direction,
}: ArrowButtonProps) => {
  return (
    <StyledArrowButton
      as={as}
      {...(onClick && !isDisabled && { onClick })}
      {...(isDisabled && { disabled: isDisabled })}
      direction={direction}
    ></StyledArrowButton>
  );
};

const StyledArrowButton = styled.button<ArrowButtonProps>`
  background: url('/trading-hub/asset/icon-arrow.svg');
  border: solid 1px ${color.grey};
  width: 40px;
  height: 40px;
  padding: 12px;
  background-size: contain;
  border-radius: 4px;
  ${({ direction }) => direction === 'up' && 'transform: rotate(180deg);'}

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;
