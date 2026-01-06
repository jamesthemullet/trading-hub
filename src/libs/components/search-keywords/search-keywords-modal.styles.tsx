import styled from '@emotion/styled';

import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import { ButtonDeprecated } from '../button/button';

export const KeyWordPill = styled.li<{ isSelected: boolean }>`
  background-color: ${({ isSelected }) =>
    isSelected ? color.accent.primary.primary : '#fff'};
  color: ${({ isSelected }) =>
    isSelected ? '#fff' : color.accent.secondary.secondary};
  border: 2px solid
    ${({ isSelected }) =>
      isSelected
        ? color.accent.primary.primary
        : color.accent.secondary.secondary};
  border-radius: 100px;
  padding: 5px 8px;
  display: inline;
  text-align: center;
  display: flex;
  align-items: center;
  margin-right: ${spacing(1)};
  position: relative;
  word-break: break-word;
  text-align: left;

  button {
    color: ${({ isSelected }) =>
      isSelected ? '#fff' : color.accent.secondary.secondary};
    text-align: left;

    &:focus {
      outline: solid
        ${({ isSelected }) =>
          isSelected ? '#fff' : color.accent.secondary.secondary};
    }
  }

  p {
    color: ${({ isSelected }) =>
      isSelected ? '#fff' : color.accent.secondary.secondary};
    display: block;
    width: 100%;
  }
`;

export const RemoveKeyWordPill = styled.button`
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: ${spacing(2)};
  background: none;
  outline: none;
  border: none;
`;

export const ModalFooter = styled.div`
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  padding: ${spacing(1.5)} ${spacing(2.5)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing(2)};

  button {
    width: 160px;
  }
`;

export const StyledCloseButton = styled(ButtonDeprecated)`
  margin-left: auto;
`;

export const Popover = styled.div<{ isOpen: string | undefined }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  background-color: ${color.surface.surfaceContainer};
  border-radius: 4px;
  z-index: 1;
  padding: ${spacing(1)} ${spacing(2)};
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0px 2px 4px 0px #0000003d;
`;
