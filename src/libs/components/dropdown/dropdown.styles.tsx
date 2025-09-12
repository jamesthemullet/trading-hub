import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { color } from '../utils/constants';
import { sizing } from '../utils/sizing';
import { spacing } from '../utils/spacing';

export const DropdownWrapper = styled.div<{
  isDropdownOpen: boolean;
  width?: number;
  hasBorder?: boolean;
  hasBorderBottom?: boolean;
  alignContentTowards?: 'left' | 'right' | 'center';
  height?: 'default' | 'large';
}>`
  width: 346px;
  position: relative;

  ${({ isDropdownOpen }) => isDropdownOpen && 'border-radius: 4px 4px 0 0;'}
  ${({ width }) => width && `width: ${width}px;`}
  ${({ width }) => width && `min-width: ${width}px;`}

  img {
    margin-right: ${spacing(1)};
  }

  ${({ hasBorderBottom = true, height }) =>
    hasBorderBottom &&
    `
    border: none;
    border-bottom: 1px solid ${color.role.outline.outline};
    border-radius: 4px 4px 0 0;
    ${height === 'large' ? `min-height: ${sizing(7)};` : ''}

    button {
      border: none;
      border-radius: 4px 4px 0 0;
      ${height === 'large' ? `min-height: ${sizing(7)};` : ''}
    }
  `}

  ${({ hasBorder }) =>
    hasBorder &&
    `
    border: 1px solid ${color.role.outline.outline};
    border-bottom: 1px solid ${color.role.outline.outline};
    border-radius: 4px;

    button {
      border-radius: 4px;
    }
  `}
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;

  height: ${sizing(5.5)};
  width: 100%;

  padding: 0;
  padding-left: ${spacing(1)};

  border-radius: 4px;
  border: 1px solid #b1b1b1;

  background-color: ${color.accent.secondary.secondaryContainer};

  ${({ isDropdownOpen }) =>
    isDropdownOpen &&
    'border-bottom: 1px solid #b1b1b1; border-radius: 4px 4px 0 0;'}

  img {
    margin-right: ${spacing(1)};
  }

  &:hover {
    background-color: ${color.lightGrey};
  }

  &:disabled {
    background-color: ${color.lightGrey};
    color: ${color.surface.onSurfaceVariant};
    cursor: default;
  }
`;

export const FlagWrapper = styled.span`
  margin-left: -${spacing(1)};
  padding-top: ${spacing(0.5)};
`;

export const DropdownHeading = styled.span`
  display: flex;
  align-items: center;

  width: 100%;

  overflow: hidden;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
export const HeadingIcon = styled.img`
  width: 20px;
  height: 20px;
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

export const Arrow = styled.span<{
  isDropdownOpen: boolean;
}>`
  transition: 0.3s;
  isolation: isolate;
  background: url('/trading-hub/asset/filled-chevron.svg');
  height: 5px;
  width: 10px;
  border: 0;
  padding: 1px;
  cursor: pointer;
  ${({ isDropdownOpen }) =>
    isDropdownOpen ? 'transform: rotate(180deg);' : ''};
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

export const DropdownContainer = styled.div<{
  isDropdownOpen: boolean;
  alignContentTowards?: string;
  contentWidth?: string;
}>`
  position: absolute;
  top: 100%;
  width: ${({ contentWidth }) => contentWidth || '100%'};
  display: none;
  border: 1px solid #b1b1b1;
  border-top: none;
  background-color: #fff;
  flex-direction: column;
  ${({ isDropdownOpen }) => isDropdownOpen && 'display: flex; z-index: 10;'}

  ${({ alignContentTowards = 'left' }) => css`
    ${alignContentTowards}: 0;
  `}
`;

export const DropdownOption = styled.button<{
  hoverColour?: string;
  align?: string;
}>`
  background-color: #fff;
  height: 40px;
  border: none;
  display: flex;
  align-items: center;
  border: none;
  text-align: ${({ align }) => (align ? align : 'center')};
  font-size: 14px;
  padding: 0 ${spacing(1)};
  cursor: pointer;
  min-height: 3.5rem;

  &:hover,
  &:active {
    ${({ hoverColour = '#f5f5f5' }) =>
      hoverColour &&
      `
      background-color: ${hoverColour};
    `}
  }

  &:last-of-type {
    border-radius: 4px;
  }
`;
