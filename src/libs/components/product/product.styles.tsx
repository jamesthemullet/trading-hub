import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';

import { color } from '../utils/constants';
import { Text } from '../typography/typography.styles';

export const ProductWrapper = styled.div<{ isLastChanged: boolean }>`
  width: 100%;
  border: solid 1px #cecece;
  padding: ${spacing(1)};
  margin: ${spacing(1)};
  box-shadow: ${({ isLastChanged }) =>
    isLastChanged
      ? `0 0 0 0.125rem #fff, 0 0 0 0.25rem ${color.infoBlueBackground}, 0 0 0.25rem 0.25rem ${color.infoBlueBackground}`
      : 'none'};
`;

export const ProductHeader = styled.div`
  margin-bottom: ${spacing(1)};
  display: flex;
  position: relative;
`;

export const ProductNumber = styled.div`
  background: #000;
  color: #fff;
  border-radius: 3px;
  width: 22px;
  height: 22px;
  text-align: center;
  padding: 0 2px 2px;
`;

export const ProductPin = styled.div`
  display: flex;

  &::before {
    content: '';
    background: url('/trading-hub/asset/icon-pin.svg');
    width: 18px;
    height: 18px;
  }
`;

export const ProductInfo = styled.div`
  margin-top: ${spacing(2)};
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-column-gap: ${spacing(1)};
  grid-row-gap: ${spacing(1)};

  & > p:nth-of-type(1) {
    grid-area: 1 / 1 / 2 / 3;
  }
  & > p:nth-of-type(2) {
    grid-area: 2 / 1 / 3 / 2;
  }
  & > p:nth-of-type(3) {
    grid-area: 2 / 2 / 3 / 3;
  }
`;

export const ProductMenuToggle = styled.button`
  user-select: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: right;
  margin-left: auto;
  padding-right: ${spacing(1)};
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
  position: absolute;
  top: 5px;
  right: ${spacing(-2)};
  width: 200px;
  background: #fff;
  border-radius: 3px;
  box-shadow: '0 0 0.125rem rgba(0, 0, 0, 0.09), 0 0.25rem 0.563rem rgba(176, 176, 176, 0.5)';
  z-index: 2;
`;

export const ProductMenuButton = styled(Text)<{ icon: string }>`
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
    background-size: 20px 20px;
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

export const LockActions = styled.div`
  display: flex;
  gap: 10px;
  border-top: solid 1px #999;
  padding-top: ${spacing(1)};
`;

export const ProductCard = styled.div`
  max-height: 160px;
  display: flex;
  justify-content: center;
  background-color: rgba(245, 245, 245, 1);
  padding: 8px;

  img {
    max-height: 160px;
    width: auto;
  }
`;
