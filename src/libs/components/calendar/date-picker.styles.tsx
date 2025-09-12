import styled from '@emotion/styled';
import { TimeInput } from '@mantine/dates';

import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
export const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
`;

export const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: ${spacing(2)};
`;

export const StyledInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${spacing(2)} 0;
  margin-bottom: ${spacing(2)};
  border-top: 1px solid ${color.surfaceDark.onSurfaceDarkVariant};
  border-bottom: 1px solid ${color.surfaceDark.onSurfaceDarkVariant};
`;

export const Content = styled.div<{ isDisabled: boolean }>`
  display: flex;
  flex-direction: column;

  ${({ isDisabled }) =>
    isDisabled
      ? `
        pointer-events: none;
        opacity: 0.5;
      `
      : ''}
`;

export const OnAllTimeContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const OnAllTimeLabel = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 10px;
`;

export const StyledInfoLabel = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 10px;
  margin-bottom: ${spacing(2)};
`;

export const StyledValueLabel = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 20px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 10px;
`;

export const StyledTimeInputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin: ${spacing(2)} 0;
`;
export const StyledTimeInput = styled(TimeInput)`
  width: 250px;
`;
