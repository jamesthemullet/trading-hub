import styled from '@emotion/styled';

import { Button } from '../buttons/button/button';
import { Title } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

export const ModalContainer = styled.div`
  width: 856px;
  height: 420px;
`;

export const KeywordList = styled.ul<{ unfinishedKeyword: boolean }>`
  margin-top: ${spacing(2)};
  padding: ${spacing(2)};
  display: flex;
  gap: ${spacing(1)};
  flex-wrap: wrap;
  width: 100%;
  background-color: ${color.surface.surface};
  overflow-y: auto;
  overflow-x: hidden;
  height: 250px;
  align-content: baseline;
  border-bottom: 1px solid;
  border-bottom-color: ${({ unfinishedKeyword }) =>
    unfinishedKeyword ? color.saleRed : color.surfaceDark.onSurfaceDarkVariant};
`;

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

export const SelectKeywordPill = styled.button`
  border: none;
  background: none;
  padding: 0;
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

export const StyledInput = styled.input`
  background-color: ${color.surface.surface};
`;

export const ModalSelectedKeyword = styled.div`
  display: flex;
  padding-top: ${spacing(2)};

  h4 {
    padding: ${spacing(1)} ${spacing(1)} 0 0;
  }
`;

export const Heading = styled(Title)`
  padding-top: ${spacing(2)};
  margin-bottom: ${spacing(2)};
  font-size: 20px;
`;

export const StyledSearchContainer = styled.div`
  width: 334px;

  button {
    height: 40px;
    right: 1rem;
  }

  input {
    min-height: 56px;
  }
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

export const ErrorContainer = styled.div`
  display: flex;
  gap: ${spacing(1)};
  align-items: center;
`;

export const ErrorText = styled.p`
  color: ${color.saleRed};
`;

export const StyledCloseButton = styled(Button)`
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
