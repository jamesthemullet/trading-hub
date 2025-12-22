import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { type ChangeEventHandler, type RefObject, useState } from 'react';

import {
  InputDeprecated,
  type InputProps,
} from '@/libs/containers/shared/input/input';
import { color } from '@/libs/utils/constants';
import { sizing } from '@/libs/utils/sizing';
import { spacing } from '@/libs/utils/spacing';

import Image from 'next/image';

type SearchProps = {
  id?: string;
  name?: string;
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  fullWidth?: boolean;
};

const SearchBoxContainer = styled.div<{
  fullWidth?: boolean;
}>`
  margin: 0;
  padding: 0;
  & div {
    & > input {
      border-radius: 30px;
    }
  }
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
`;

const SearchIcon = styled(Image)`
  margin-left: ${spacing(2.5)};
  position: absolute;
`;

const ClearButton = styled.button`
  position: absolute;
  right: ${spacing(1)};
  background: none;
  border: none;
  padding: ${spacing(1)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
`;

export const Search = ({
  name,
  id,
  value,
  onChange,
  placeholder,
  ...rest
}: SearchProps) => {
  const [currentValue, setCurrentValue] = useState('');

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(event.target.value);

    onChange?.(event);
  };

  return (
    <SearchBoxContainer {...rest}>
      <SearchBox
        inputProps={{
          isLabelHidden: true,
          label: name || 'Search category identifier or user name',
          placeholder: placeholder || 'Search...',
          required: true,
          id: id || 'searchId',
          name: name || 'searchTerm',
          onChange: handleOnChange,
          autoComplete: 'off',
          autoCapitalize: 'off',
          autoCorrect: 'off',
          value: value ?? currentValue,
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

const StyledInput = styled(InputDeprecated)`
  &::placeholder {
    color: ${color.surface.onSurfaceVariant};
  }

  ${resetSearchInput}

  background-color: ${color.surface.surfaceContainer};
  border: 1px solid ${color.surface.onSurfaceVariant};
  height: ${sizing(7)};
  padding-left: 50px;
  padding-right: ${spacing(5)};
`;

type SearchBoxProps = {
  inputProps: {
    ref?: RefObject<HTMLInputElement>;
  } & InputProps;
};

export const SearchBox = ({ inputProps }: SearchBoxProps) => {
  const handleClear = () => {
    if (inputProps.onChange) {
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      inputProps.onChange(syntheticEvent);
    }
  };

  return (
    <Wrapper>
      <SearchIcon
        src="/trading-hub/asset/icon-search.svg"
        alt=""
        width={20}
        height={20}
      />
      <StyledInput type="search" {...inputProps} />
      {inputProps.value && (
        <ClearButton
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <Image
            src="/trading-hub/asset/icon-x.svg"
            alt=""
            width={14}
            height={14}
          />
        </ClearButton>
      )}
    </Wrapper>
  );
};
