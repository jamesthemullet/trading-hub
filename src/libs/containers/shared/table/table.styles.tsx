import styled from '@emotion/styled';

import { Label } from '@/libs/components/typography/typography.styles';
import { color } from '@/libs/components/utils/constants';
import { spacing } from '@/libs/components/utils/spacing';

import Link from 'next/link';

export const TableContainer = styled.div`
  margin: ${spacing(2)} 0;
  margin-bottom: 10px;
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 2fr) 200px 350px 180px;
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
    24px minmax(auto, 340px) minmax(auto, 340px) minmax(100px, auto)
    230px;
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
      isExcluded && `background-color: ${color.state.error.errorContainer}`}
  }

  ${({ isPinned }) =>
    isPinned && `background-color: ${color.successGreenBackground}`}

  ${({ isExcluded }) =>
    isExcluded && `background-color: ${color.state.error.errorContainer}`}
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

export const TableActionsButton = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'hasDropdown',
})<{ hasDropdown: boolean }>`
  border: none;
  color: #000;
  background-color: #f5f5f5;
  transition: background-color 0.1s ease-in;
  text-decoration: none;
  padding: ${spacing(1)} ${spacing(2)};
  width: 100%;
  border-radius: 4px;
  border: solid 1px ${color.surface.onSurfaceVariant};

  ${({ hasDropdown }) =>
    hasDropdown && 'border-right: none;border-radius: 4px 0 0 4px;'}

  &:hover {
    background-color: #e3e3e3;
  }
`;

export const TableActions = styled.div`
  position: relative;
  display: flex;
  margin-left: 30px;
`;

export const DropdownOptions = styled.div`
  position: absolute;
  top: 20px;
  background-color: #f5f5f5;
  width: 100%;
  z-index: 1;
  left: -120px;
  border-radius: 5px;
  width: 165px;
`;

export const TableDropdown = styled.button`
  width: 100%;
  padding: ${spacing(1)} ${spacing(2)};
  z-index: 1;
  border: none;
  border-bottom: solid 1px #999;
  box-shadow: #000 0 4px 2px -4px;
  font-family: inherit;
  font-size: inherit;
  text-align: left;

  &:hover,
  &:active {
    background-color: #e3e3e3;
  }
`;

export const TableLink = styled(Link)`
  width: 100%;
  padding: ${spacing(1)} ${spacing(2)};
  z-index: 1;
  border: none;
  border-bottom: solid 1px #999;
  font-family: inherit;
  font-size: inherit;
  text-align: left;
  display: block;
  color: #000;
  text-decoration: none;

  &:hover,
  &:active {
    background-color: #e3e3e3;
  }
`;
