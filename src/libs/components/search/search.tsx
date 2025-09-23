import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { ChangeEventHandler } from 'react';
import type { ReactElement, RefObject } from 'react';

import { Input, type InputProps } from '@/libs/containers/shared/input/input';
import { mediaQuery } from '@/libs/utils/media-query';
import { sizing } from '@/libs/utils/sizing';
import { spacing } from '@/libs/utils/spacing';

import { Button, type ButtonProps } from '../button/button';
import { Icon } from '../icon/icon';

export type SearchProps = {
  id?: string;
  name?: string;
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
};

const SearchBoxContainer = styled.div`
  margin: 0;
  padding: 0;
  & div {
    border-bottom: 1px solid #b1b1b1;

    & > input {
      border-radius: 4px 4px 0 0;
    }
  }
`;

const StyledIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  background-color: #000;
  mask-size: 20px;
`;

export const Search = ({
  name,
  id,
  value,
  onChange,
  placeholder,
  ...rest
}: SearchProps) => {
  return (
    <SearchBoxContainer {...rest}>
      <SearchBox
        iconButtonProps={{
          id: 'SearchIconInputBtn',
          searchIcon: <StyledIcon name="Search" />,
        }}
        inputProps={{
          isLabelHidden: true,
          label: name || 'Search category identifier or user name',
          placeholder: placeholder || 'Search...',
          required: true,
          id: id || 'searchId',
          name: name || 'searchTerm',
          onChange,
          autoComplete: 'off',
          autoCapitalize: 'off',
          autoCorrect: 'off',
          value,
        }}
      />
    </SearchBoxContainer>
  );
};

const resetSearchInput = css`
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
    height: ${sizing(7)};
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
  hideIcon?: boolean;
  inputProps: {
    ref?: RefObject<HTMLInputElement>;
  } & InputProps;
  iconButtonProps: {
    searchIcon?: ReactElement;
    buttonAriaLabel?: string;
  } & Partial<ButtonProps>;
};

export const SearchBox = ({
  iconPosition = 'right',
  hideIcon = false,
  inputProps,
  iconButtonProps,
}: SearchBoxProps) => {
  const {
    searchIcon = !hideIcon && <Icon name="Search" size={32} />,
    buttonAriaLabel = 'Search button',
    ...iconButtonPropsRest
  } = iconButtonProps;
  return (
    <Wrapper>
      <StyledInput type="search" {...inputProps} iconPosition={iconPosition} />
      {searchIcon && (
        <StyledButton
          type="submit"
          aria-label={buttonAriaLabel}
          iconPosition={iconPosition}
          {...iconButtonPropsRest}
        >
          {searchIcon}
        </StyledButton>
      )}
    </Wrapper>
  );
};
