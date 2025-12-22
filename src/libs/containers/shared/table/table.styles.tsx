import styled from '@emotion/styled';

import { fonts, Label } from '@/libs/components/typography/typography.styles';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

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

type FacetAttributeValuesTableRowProps = {
  isPinned?: boolean;
  isExcluded?: boolean;
  isHeading?: boolean;
};

export const FacetAttributeValuesTableRow = styled(
  TableRow
)<FacetAttributeValuesTableRowProps>`
  grid-template-columns:
    24px 250px 140px minmax(230px, 1fr) minmax(280px, 1fr)
    40px;
  border-bottom: none;
  align-items: center;
  margin: 0 ${spacing(3)} ${spacing(2)};
  box-shadow: #000 0 0 10px -5px;
  padding: ${spacing(2)};

  p {
    ${({ isHeading }) =>
      isHeading &&
      `

    font-size: 16px;
  `}
  }

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
export const EditFacetAttributesModalTableRow = styled(
  TableRow
)<FacetAttributeValuesTableRowProps>`
  grid-template-columns: minmax(auto, 3fr) minmax(auto, 2fr);
  border-bottom: none;
  align-items: flex-start;
  margin: 0;
  padding: ${spacing(2)};
  box-shadow: #000 0 0 10px -5px;

  p {
    ${({ isHeading }) =>
      isHeading &&
      `

    font-size: 16px;
  `}
  }

  &:first-of-type {
    position: static;
  }
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
  font-weight: 600;
  font-family: ${fonts.semiBold};
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
