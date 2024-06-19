import styled from '@emotion/styled';
import { type ChangeEventHandler } from 'react';

import { Icon } from '../icon/icon';
import { SearchBox } from '../search-box/search-box';

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
  & > div {
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
          icon: <StyledIcon name="Search" />,
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
          size: 32,
        }}
      />
    </SearchBoxContainer>
  );
};
