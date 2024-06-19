import styled from '@emotion/styled';

import { Label } from '../typography/typography.styles';
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

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  padding: ${spacing(1)};
  color: #1d1d1b;

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

export const SelectedCategoryPill = styled(Label)`
  margin-bottom: ${spacing(1)};
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
