import type { ReactElement, RefObject } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type ButtonProps, Button } from '../button/button';
import { Icon } from '../icon/icon';
import { type InputProps, Input } from '../input/input';
import {
  Box,
  resetSearchInput,
  sizing,
  spacing,
} from '@onyx/ui/components/core-lib';
import { colourDictionary } from '../utils/constants';
import { mediaQuery } from '../utils/media-query';

const Wrapper = styled(Box)`
  position: relative;
`;

type IconPosition = 'left' | 'right';

const StyledInput = styled(Input)<{ iconPosition: IconPosition }>`
  &::placeholder {
    color: ${({ theme }) => theme.colours.text.main};
  }

  ${resetSearchInput}

  ${mediaQuery('md')} {
    background-color: ${colourDictionary.grey[100]};
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
    variant = 'link - deprecated',
    buttonAriaLabel = 'Search button',
    ...iconButtonPropsRest
  } = iconButtonProps;
  return (
    <Wrapper display="flex" alignItems="center">
      <StyledInput type="search" {...inputProps} iconPosition={iconPosition} />
      <StyledButton
        type="submit"
        variant={variant}
        aria-label={buttonAriaLabel}
        iconPosition={iconPosition}
        {...iconButtonPropsRest}
      >
        {icon}
      </StyledButton>
    </Wrapper>
  );
};
