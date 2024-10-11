import styled from '@emotion/styled';

import { Label } from '@/libs/components/typography/typography.styles';
import { color } from '@/libs/components/utils/constants';
import { spacing } from '@/libs/components/utils/spacing';

export const TableContainer = styled.div`
  margin: ${spacing(2)} 0;
  margin-bottom: 10px;
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: minmax(140px, 2fr) 200px 350px 180px;
  border-bottom: 1px solid #b1b1b1;
  align-items: center;
  padding-left: ${spacing(2)};

  &:first-of-type {
    position: sticky;
    z-index: 1;
    top: 30px;
    background: #fff;
  }
`;
export const FacetsTableRow = styled(TableRow)`
  grid-template-columns: minmax(170px, 2fr) 120px 150px 150px 150px;
`;

type FacetAttributeValuesTableRowProps = {
  isPinned?: boolean;
  isExcluded?: boolean;
};
export const FacetAttributeValuesTableRow = styled(
  TableRow
)<FacetAttributeValuesTableRowProps>`
  grid-template-columns:
    24px minmax(auto, 340px) minmax(auto, 340px) minmax(50px, auto)
    200px;
  border-bottom: none;
  align-items: center;
  margin-bottom: ${spacing(2)};
  box-shadow: #000 0 0 10px -5px;
  padding: ${spacing(2)};

  &:first-of-type {
    position: static;
    ${({ isPinned }) =>
      isPinned && `background-color: ${color.successGreenBackground}`}

    ${({ isExcluded }) =>
      isExcluded && `background-color: ${color.errorRedBackground}`}
  }

  ${({ isPinned }) =>
    isPinned && `background-color: ${color.successGreenBackground}`}

  ${({ isExcluded }) =>
    isExcluded && `background-color: ${color.errorRedBackground}`}
`;

export const TableCol = styled.div`
  text-overflow: ellipsis;
  display: flex;
  padding: ${spacing(1)} ${spacing(1)} ${spacing(1)} 0;

  p {
    width: 100%;
  }
`;

export const TableHeading = styled(Label)`
  color: #1d1d1b;
  font-weight: bold;
`;

const ORDER_TO_COLOR = [
  {
    asc: '#bbb',
    desc: '#666',
    unsorted: '#bbb',
  },
  {
    asc: '#666',
    desc: '#bbb',
    unsorted: '#bbb',
  },
];

export const TableColumnOrder = styled.div<{
  order: 'asc' | 'desc' | 'unsorted';
}>`
  position: relative;
  ::before,
  ::after {
    border: 4px solid transparent;
    content: '';
    display: block;
    height: 0;
    right: 5px;
    top: 50%;
    position: absolute;
    width: 0;
  }

  ::before {
    border-bottom-color: ${({ order }) => ORDER_TO_COLOR[0][order]};
    margin-top: -9px;
  }

  ::after {
    border-top-color: ${({ order }) => ORDER_TO_COLOR[1][order]};
    margin-top: 1px;
  }
`;

export const TableDateContainer = styled.div`
  p {
    line-height: 1;
  }
`;

export const TableOptionButton = styled.button<{ isOpen: boolean }>`
  position: relative;
  width: 50px;
  border: none;
  border-radius: 0;
  background-color: #f5f5f5;
  transition: background-color 0.1s ease-in;
  border-left: solid 1px #999;

  border-right: solid 1px ${color.accessibilityGrey};
  border-top: solid 1px ${color.accessibilityGrey};
  border-bottom: solid 1px ${color.accessibilityGrey};
  border-radius: 0 4px 4px 0;

  &::before {
    border: 4px solid transparent;
    border-bottom-color: ${({ isOpen }) => isOpen && '#000'};
    border-top-color: ${({ isOpen }) => !isOpen && '#000'};
    content: '';
    display: block;
    height: 0;
    right: 15px;
    top: ${({ isOpen }) => (isOpen ? '35%' : '18px')};
    position: absolute;
    width: 0;
  }

  &:hover {
    background-color: #e3e3e3;
  }
`;

export const TableActionsButton = styled.a`
  border: none;
  color: #000;
  background-color: #f5f5f5;
  transition: background-color 0.1s ease-in;
  text-decoration: none;
  padding: ${spacing(1)} ${spacing(2)};
  width: 100%;

  &:hover {
    background-color: #e3e3e3;
  }

  border-left: solid 1px ${color.accessibilityGrey};
  border-top: solid 1px ${color.accessibilityGrey};
  border-bottom: solid 1px ${color.accessibilityGrey};
  border-radius: 4px 0 0 4px;
`;

export const TableActions = styled.div`
  position: relative;
  display: flex;
`;

export const DropdownOptions = styled.div`
  position: absolute;
  top: 40px;
  background-color: #f5f5f5;
  width: 100%;
  z-index: 1;
`;

export const TableDropdown = styled.button`
  width: 100%;
  padding: ${spacing(1)} ${spacing(2)};
  z-index: 1;
  border: none;
  border-top: solid 1px #999;
  box-shadow: #000 0 4px 2px -4px;
  font-family: inherit;
  font-size: inherit;
  text-align: left;

  &:hover,
  &:active {
    background-color: #e3e3e3;
  }
`;
