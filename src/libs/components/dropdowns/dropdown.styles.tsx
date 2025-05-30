import styled from '@emotion/styled';

import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { sizing } from '../utils/sizing';
import { spacing } from '../utils/spacing';

export const DropdownWrapper = styled.div<{
  isDropdownOpen: boolean;
  width?: number;
}>`
  width: 346px;
  position: relative;

  ${({ isDropdownOpen }) => isDropdownOpen && 'border-radius: 4px 4px 0 0;'}
  ${({ width }) => width && `width: ${width}px;`}
  ${({ width }) => width && `min-width: ${width}px;`}

  img {
    width: 24px;
    height: 24px;
    margin-right: ${spacing(1)};
  }
`;

export const DropdownWrapperNoBorder = styled(DropdownWrapper)`
  border: none;
  border-bottom: 1px solid ${color.role.outline.outline};
  border-radius: 4px 4px 0 0;
  min-height: 56px;

  button {
    border: none;
    border-radius: 4px 4px 0 0;
    min-height: 56px;
  }
`;

export const DropdownButton = styled.button<{ isDropdownOpen: boolean }>`
  align-items: center;
  border-radius: 4px;
  border: 1px solid #b1b1b1;
  background-color: ${color.backgroundGrey};
  display: flex;
  height: ${sizing(5.5)};
  justify-content: space-between;
  align-items: center;
  padding: 0;
  width: ${sizing('100%')};

  ${({ isDropdownOpen }) =>
    isDropdownOpen &&
    'border-bottom: 1px solid #b1b1b1; border-radius: 4px 4px 0 0;'}

  &:hover {
    background-color: ${color.lightGrey};
  }

  &:disabled {
    background-color: ${color.lightGrey};
    color: ${color.accessibilityGrey};
    cursor: default;
  }
`;

export const FlagWrapper = styled.span`
  margin-left: -${spacing(1)};
  padding-top: ${spacing(0.5)};
`;

export const FlagHeading = styled.span`
  display: flex;
  align-items: center;
`;

export const DropdownHeading = styled(Text)`
  padding-left: ${spacing(2)};
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
`;

export const ArrowContainer = styled.div<{ borderLeft?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: ${sizing(5)};
  box-sizing: border-box;
  cursor: pointer;

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

export const Menu = styled.span`
  transition: 0.3s;
  isolation: isolate;
  background: url('/trading-hub/asset/icon-menu.svg');
  height: 16px;
  width: 4px;
  border: 0;
  padding: 2px;
`;

export const DropdownContainer = styled.div<{ isDropdownOpen: boolean }>`
  position: absolute;
  top: 100%;
  width: 100%;
  display: none;
  border: 1px solid #b1b1b1;
  border-top: none;
  background-color: #fff;
  flex-direction: column;
  ${({ isDropdownOpen }) => isDropdownOpen && 'display: flex; z-index: 10'}
`;

export const DropdownOption = styled.button<{
  hoverColour: string;
  align?: string;
}>`
  background-color: #fff;
  height: 40px;
  border: none;
  display: flex;
  align-items: center;
  text-align: ${({ align }) => (align ? align : 'center')};
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
