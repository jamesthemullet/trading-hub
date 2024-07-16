import styled from '@emotion/styled';

import { Text } from '../typography/typography.styles';
import { sizing } from '../utils/sizing';
import { spacing } from '../utils/spacing';

export const DropdownWrapper = styled.div<{
  isDropdownOpen: boolean;
  width?: number;
}>`
  border: 1px solid #b1b1b1;
  border-radius: 4px;
  width: 346px;
  position: relative;

  ${({ isDropdownOpen }) => isDropdownOpen && 'border-radius: 4px 4px 0 0;'}
  ${({ width }) => width && `width: ${width}px;`}

  img {
    width: 24px;
    height: 24px;
    margin-right: ${spacing(1)};
  }
`;

export const DropdownButton = styled.button<{ isDropdownOpen: boolean }>`
  align-items: center;
  border: none;
  border-radius: 4px;
  display: flex;
  height: ${sizing(5)};
  justify-content: space-between;
  align-items: center;
  padding: 0;
  width: ${sizing('100%')};
  box-sizing: content-box;

  ${({ isDropdownOpen }) =>
    isDropdownOpen &&
    'border-bottom: 1px solid #b1b1b1; border-radius: 4px 4px 0 0;'}
`;

export const DropdownHeading = styled(Text)`
  display: flex;
  align-items: center;
  padding-left: ${spacing(1)};
  text-align: left;

  p {
    display: flex;
    align-items: center;
  }
`;

export const ArrowContainer = styled.div<{ borderLeft?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: ${sizing(5)};
  box-sizing: border-box;

  ${({ borderLeft }) => borderLeft && 'border-left: 1px solid #b1b1b1;'}
`;

export const Arrow = styled.span<{ isDropdownOpen: boolean }>`
  transition: 0.3s;
  isolation: isolate;
  background: url('/trading-hub/asset/filled-chevron.svg');
  height: 5px;
  width: 10px;
  border: 0;
  padding: 1px;
  ${({ isDropdownOpen }) =>
    isDropdownOpen ? 'transform: rotate(180deg);' : ''}
`;

export const DropdownContainer = styled.div<{ isDropdownOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: -1px;
  display: none;
  width: inherit;
  border: 1px solid #b1b1b1;
  border-top: none;
  background-color: #fff;
  flex-direction: column;
  ${({ isDropdownOpen }) => isDropdownOpen && 'display: flex; z-index: 10'}
`;

export const DropdownOption = styled.button<{ hoverColour: string }>`
  background-color: #fff;
  height: 40px;
  border: none;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 0 ${spacing(1)};

  &:hover,
  &:active {
    ${({ hoverColour }) =>
      hoverColour &&
      `
      background-color: ${hoverColour};
    `}
  }

  &:last-of-type {
    border-radius: 4px;
  }
`;
