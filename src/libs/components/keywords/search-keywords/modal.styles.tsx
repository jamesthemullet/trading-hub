import styled from '@emotion/styled';

import { Button } from '../../buttons/button/button';
import { Title } from '../../typography/typography.styles';
import { color } from '../../utils/constants';
import { spacing } from '../../utils/spacing';

export const ModalContainer = styled.div`
  width: 856px;
  height: 400px;
`;

export const KeywordList = styled.ul<{ unfinishedKeyword: boolean }>`
  margin-top: ${spacing(2)};
  padding: ${spacing(2)};
  display: flex;
  gap: ${spacing(1)};
  flex-wrap: wrap;
  width: 100%;
  background-color: ${color.backgroundGrey};
  overflow-y: auto;
  overflow-x: hidden;
  height: 260px;
  max-height: 260px;
  align-content: baseline;
  border-bottom: ${({ unfinishedKeyword }) =>
    unfinishedKeyword ? `1px solid ${color.saleRed}` : 'none'};
`;

export const KeyWordPill = styled.li`
  background-color: #fff;
  color: ${color.selectionBox};
  border: 2px solid ${color.selectionBox};
  border-radius: 6px;
  padding: 8px;
  font-weight: 600;
  display: inline;
  text-align: center;
  font-size: 16px;
  display: flex;
  align-items: center;
  height: 36px;

  button {
    width: 18px;
    height: 18px;
    padding: 0;
    margin-left: ${spacing(1)};
    background: none;
    outline: none;
    border: none;
  }
`;

export const StyledInput = styled.input`
  background-color: ${color.backgroundGrey};
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
  }

  input {
    min-height: 56px;
  }

  .icon {
    margin-right: 20px;
  }
`;

export const ModalFooter = styled.div`
  background-color: #fff;
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.grey};
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
