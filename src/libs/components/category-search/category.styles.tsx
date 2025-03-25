import styled from '@emotion/styled';

import { Button } from '../buttons/button/button';
import { Icon } from '../icon/icon';
import { Label, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

export const Wrapper = styled.div`
  input {
    min-height: 54px;
  }
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

export const Categories = styled.div`
  border-radius: 4px 4px 0 0;
  background-color: ${color.backgroundGrey};
  border-bottom: 1px solid #b1b1b1;
  padding: ${spacing(1)} ${spacing(1)} 0;
`;

export const CategoryTitle = styled(Text)`
  margin-bottom: ${spacing(1)};
  line-height: 1.6rem;
`;

export const SearchBox = styled.div`
  display: flex;
`;

export const SearchWrapper = styled.div<{
  hasModal: boolean;
}>`
  background-color: ${color.backgroundGrey};
  display: flex;
  border-bottom: 1px solid ${color.lightGrey};
  min-width: ${({ hasModal }) => (hasModal ? '600px' : '710px')};
  & div {
    border-bottom: none;
  }
`;

export const SelectedCategories = styled.div`
  padding: ${spacing(1)};
  display: flex;

  & > li {
    margin-right: ${spacing(1)};
  }

  p {
    height: 36px;
    padding: 2px 8px;
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
  margin-left: ${spacing(1)};
  height: 54px;

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

export const ViewAllButton = styled(Button)`
  min-width: 110px;
  margin-top: ${spacing(1)};
  margin-left: ${spacing(1)};
`;

export const SelectedCategoryPill = styled(Label)`
  margin-bottom: ${spacing(1)};
  margin-right: ${spacing(1)};
  color: #fff;
  background-color: ${color.selectionBox};
  border-radius: 6px;
  padding: ${spacing(1)} ${spacing(2)};
  display: inline-flex;
  align-items: center;
`;

export const SelectedCategoryClose = styled.button`
  background: url('/trading-hub/asset/icon-close.svg');
  width: 19px;
  height: 18px;
  display: inline-block;
  border: none;
`;

export const ModalWrapper = styled.div`
  width: 856px;
  height: 400px;
  padding-top: ${spacing(2)};
  overflow: auto;
`;

export const ModalSelectedCategory = styled.div`
  display: flex;
  padding-top: ${spacing(1)};

  h4 {
    padding: ${spacing(1)} ${spacing(1)} 0 0;
  }
`;
export const ModalCategoriesList = styled.ul`
  margin-top: ${spacing(2)};
  padding: ${spacing(2)};
  display: flex;
  gap: ${spacing(1)};
  flex-wrap: wrap;
  width: 100%;
  background-color: ${color.backgroundGrey};
  overflow-y: auto;
  overflow-x: hidden;
  height: 160px;
  max-height: 260px;
  align-content: baseline;
`;
