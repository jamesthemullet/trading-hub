import styled from '@emotion/styled';

import { Icon, Text } from '@/libs/components';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

export const Wrapper = styled.div`
  input {
    min-height: 54px;
  }
`;

export const DropdownWrapper = styled.div`
  display: flex;
  gap: ${spacing(1)};
  align-items: center;
`;
export const DropdownText = styled(Text)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const Container = styled.div`
  margin-top: -1px;
  position: relative;
  box-shadow: rgb(0 0 0 / 10%) 0 0 5px 2px;
  background: #f5f5f5;
`;

export const Row = styled.button`
  display: flex;
  flex-direction: row;
  padding: ${spacing(1)};
  color: #1d1d1b;
  border: none;
  background: none;
  text-align: left;

  &:hover {
    background: #f1f1f1;
    cursor: pointer;
  }
`;

export const SearchWrapper = styled.div`
  background-color: ${color.accent.secondary.secondaryContainer};
  display: flex;
  border-bottom: 1px solid ${color.lightGrey};
  width: 335px;
  & div {
    border-bottom: none;
  }
`;

export const SearchForm = styled.form`
  position: relative;
  margin-left: auto;
  width: 100%;
  height: 54px;
`;

export const SearchInput = styled.input`
  border: none;
  background: none;
  padding-left: ${spacing(1)};
  padding-right: ${spacing(4)};
  height: 54px;
  width: 335px;

  &::placeholder {
    color: #222222;
  }
`;

export const SearchValue = styled.button`
  border: none;
  background: none;

  &:disabled {
    cursor: auto;
  }
`;

export const StyledIcon = styled(Icon)`
  position: absolute;
  right: 4px;
  top: 12px;
  pointer-events: none;
`;

export const ModalWrapper = styled.div`
  width: 856px;
  height: 400px;
  padding-top: ${spacing(2)};
  overflow: auto;
`;

export const ModalSelectedCategory = styled.div`
  display: flex;
  align-items: center;
  padding-top: ${spacing(2)};

  h4 {
    padding: ${spacing(1)} ${spacing(1)} 0 0;
    margin-right: ${spacing(2)};
  }
`;
export const ModalCategoriesList = styled.ul`
  margin-top: ${spacing(2)};
  padding: ${spacing(2)};
  display: flex;
  gap: ${spacing(1)};
  flex-wrap: wrap;
  width: 100%;
  background-color: ${color.accent.secondary.secondaryContainer};
  overflow-y: auto;
  overflow-x: hidden;
  height: 205px;
  align-content: baseline;
  border-bottom: 1px solid ${color.surfaceDark.onSurfaceDarkVariant};
`;
