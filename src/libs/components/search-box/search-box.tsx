import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactElement, RefObject } from 'react';

import { Button, type ButtonProps } from '../buttons/button/button';
import { Icon } from '../icon/icon';
import { Input, type InputProps } from '../input/input';
import { mediaQuery } from '../utils/media-query';
import { sizing } from '../utils/sizing';
import { spacing } from '../utils/spacing';

export const resetSearchInput = css`
  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    display: none;
  }
`;

const Wrapper = styled.div`
  display: flex;
  position: relative;
  align-items: center;
`;

type IconPosition = 'left' | 'right';

const StyledInput = styled(Input)<{
  iconPosition: IconPosition;
}>`
  &::placeholder {
    color: #000;
  }

  ${resetSearchInput}

  ${mediaQuery('md')} {
    background-color: #f5f5f5;
    border-color: transparent;
    height: ${sizing(5)};
  }

  ${({ iconPosition }) =>
    iconPosition === 'left'
      ? css`
          padding-left: ${spacing(5)};
          &:focus {
            padding-left: calc(${spacing(5)} - 1px);
          }
        `
      : css`
          padding-right: ${spacing(5)};
        `}
`;

const StyledButton = styled(Button)<{ iconPosition: IconPosition }>`
  height: ${sizing(4)};
  width: ${sizing(4)};
  position: absolute;
  background: none;
  border: none;
  .icon {
    flex-shrink: 1;
  }
  ${({ iconPosition }) =>
    iconPosition === 'left'
      ? css`
          left: ${spacing(1)};
        `
      : css`
          right: ${spacing(1)};
        `}
`;

export type SearchBoxProps = {
  iconPosition?: IconPosition;
  inputProps: {
    ref?: RefObject<HTMLInputElement>;
  } & InputProps;
  iconButtonProps: {
    icon?: ReactElement;
    buttonAriaLabel?: string;
  } & Partial<ButtonProps>;
};

export const SearchBox = ({
  iconPosition = 'right',
  inputProps,
  iconButtonProps,
}: SearchBoxProps) => {
  const {
    icon = <Icon name="Search" size={32} />,
    buttonAriaLabel = 'Search button',
    ...iconButtonPropsRest
  } = iconButtonProps;
  return (
    <Wrapper>
      <StyledInput type="search" {...inputProps} iconPosition={iconPosition} />
      <StyledButton
        type="submit"
        aria-label={buttonAriaLabel}
        iconPosition={iconPosition}
        {...iconButtonPropsRest}
      >
        {icon}
      </StyledButton>
    </Wrapper>
  );
};
