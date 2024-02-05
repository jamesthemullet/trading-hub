import { type ChangeEventHandler } from 'react';

import styled from '@emotion/styled';
import { SearchBox } from '../search-box/search-box';
import { Icon } from '../icon/icon';

export type SearchProps = {
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
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

export const Search = ({ value, onChange, ...rest }: SearchProps) => {
  return (
    <SearchBoxContainer {...rest}>
      <SearchBox
        iconButtonProps={{
          id: 'SearchIconInputBtn',
          icon: <StyledIcon name="Search" />,
        }}
        inputProps={{
          isLabelHidden: true,
          label: 'Search category identifier or user name',
          placeholder: 'Search...',
          required: true,
          id: 'searchId',
          name: 'searchTerm',
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
