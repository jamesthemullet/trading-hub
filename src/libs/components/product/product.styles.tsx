import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { boxShadow } from '../utils/shared.styles';
import { spacing } from '../utils/spacing';

export const ProductWrapper = styled.div`
  width: 100%;
  border: solid 1px ${color.grey};
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

export const ProductHeader = styled.div`
  padding: ${spacing(1)};
  display: flex;
  position: relative;
  align-items: center;
`;

export const ProductNumber = styled.div`
  background: #000;
  color: #fff;
  border-radius: 3px;
  min-width: 18px;
  height: 18px;
  text-align: center;
  padding: 2px;
  font-size: 14px;
  line-height: 14px;
  margin: 0px 8px 0 0;
`;

export const ProductPin = styled.div`
  display: flex;
  align-items: center;

  &::before {
    content: '';
    background: url('/trading-hub/asset/icon-pin.svg');
    width: 18px;
    height: 18px;
  }
`;

export const BoostPin = styled.div`
  display: flex;
  align-items: center;

  &::before {
    content: '';
    background: url('/trading-hub/asset/boost-signifier.svg');
    width: 16px;
    height: 16px;
    background-size: contain;
    margin: 0px 5px 0 3px;
  }
`;

export const BuriedPin = styled.div`
  display: flex;
  align-items: center;

  &::before {
    content: '';
    background: url('/trading-hub/asset/bury-signifier.svg');
    width: 16px;
    height: 16px;
    background-size: contain;
    margin: 0px 5px 0 3px;
  }
`;

export const BlockedPin = styled.div`
  display: flex;
  align-items: center;

  &::before {
    content: '';
    background: url('/trading-hub/asset/icon-block.svg');
    width: 16px;
    height: 16px;
    background-size: contain;
    margin: 0px 5px 0 3px;
  }
`;

export const ProductInfo = styled.div<{ isSearchResult?: boolean }>`
  margin-top: ${spacing(1)};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(1, 1fr);
  grid-column-gap: ${spacing(1)};
  grid-row-gap: ${spacing(1)};
  padding: ${spacing(1)};
  flex-grow: 1;

  & > p:nth-of-type(1) {
    grid-area: 1 / 1 / 2 / 4;
  }
  & > p:nth-of-type(2) {
    grid-area: 2 / 1 / 3 / 2;
  }
  & > p:nth-of-type(3) {
    grid-area: 2 / 2 / 3 / 4;
  }

  ${({ isSearchResult }) =>
    isSearchResult &&
    css`
      p {
        font-size: 12px;
      }
    `}
`;

export const ProductInfoWrapper = styled.div<{ hasBulkAction: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  ${({ hasBulkAction }) => hasBulkAction && 'justify-content: center;'}
`;

export const ProductMenuToggle = styled.button<{ hasBulkAction: boolean }>`
  margin-left: auto;
  user-select: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: right;
  padding: 0;
  height: 20px;
  ${({ hasBulkAction }) => !hasBulkAction && 'margin-left: auto;'}
`;

export const ProductMenuOverlay = styled.button`
  position: fixed;
  background: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  border: none;
`;

export const ProductMenu = styled.div`
  ${boxShadow}
  position: absolute;
  top: 30px;
  left: 0;
  width: 100%;
  min-width: 160px;
  background: #fff;
  border-radius: 3px;
  z-index: 2;
`;

export const ProductMenuButton = styled(Text)<{ icon: string; size?: string }>`
  border: none;
  background: #fff;
  width: 100%;
  min-height: 40px;
  text-align: left;
  display: flex;
  padding-top: ${spacing(1.5)};

  &:hover,
  &:focus {
    background-color: ${color.lightGreen};
    outline: none;
    box-shadow: none;
  }

  &::before {
    content: '';
    background: no-repeat 0 0;
    background-image: ${({ icon }) =>
      `url(/trading-hub/asset/icon-${icon}.svg)`};
    background-size: ${({ size }) => (size ? size : `20px 20px`)};
    width: 25px;
    height: 20px;
  }
`;

export const LockMenu = styled.div`
  background: #fff;
  padding: ${spacing(1)};
`;

export const LockInput = styled.input<{ hasError: boolean }>`
  border: none;
  border-bottom: 1px solid
    ${({ hasError }) => (hasError ? color.errorRed : color.grey)};
  padding: ${spacing(2)};
  background-color: ${color.backgroundGrey};
  width: 100%;
  margin-bottom: ${spacing(1)};
`;

export const ErrorText = styled(Text)`
  margin-bottom: ${spacing(1)};
  color: ${color.errorRed};
`;

export const LockActions = styled.div<{ isSearchResult?: boolean }>`
  display: flex;
  gap: ${({ isSearchResult }) => (isSearchResult ? spacing(0.5) : spacing(1))};
  border-top: solid 1px #999;
  padding-top: ${spacing(1)};

  ${({ isSearchResult }) =>
    isSearchResult &&
    css`
      button {
        font-size: 14px;
        padding: 8px;
      }
    `}
`;

export const ProductCard = styled.div<{ hasSupplementaryInfo?: boolean }>`
  border-top: ${({ hasSupplementaryInfo }) =>
    hasSupplementaryInfo ? `1px solid ${color.grey}` : 'none'};
  height: 176px;
  position: relative;
  display: flex;
  justify-content: center;
  background-color: rgba(245, 245, 245, 1);
  padding: 8px;

  img {
    height: 160px;
    width: auto;
    max-width: 100%;
  }
`;

export const SupplementaryInfo = styled.div`
  border-top: solid 1px ${color.grey};
  padding: ${spacing(1)};

  p {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    align-items: end;

    span {
      font-weight: bold;
    }

    &:first-of-type {
      span {
        color: ${color.successGreen};
      }
    }
  }
`;

export const StyledPinText = styled(Text)`
  line-height: 20px;
`;
