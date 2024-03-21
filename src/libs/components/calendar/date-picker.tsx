import {
  DatePicker as MantineDatePicker,
  DatePickerProps,
} from '@mantine/dates';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { formatMonthDayDateRange } from './format-date-range';
import { Toggle } from '../toggle/toggle';

const StyledDatePicker = styled(MantineDatePicker<'range'>)`
  & .mantine-DatePicker-day[data-outside='true'] {
    opacity: 0;
  }

  & .mantine-DatePicker-day[data-weekend='true'] {
    color: #000000;
  }

  & .mantine-DatePicker-weekday {
    color: #000000;
  }
`;

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 16px;
`;

const OnAllTimeContainer = styled.div`
  display: flex;
`;

const OnAllTimeLabel = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 10px;
`;

const StyledInfoLabel = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 10px;
  margin-bottom: 16px;
`;

const StyledDateRangeLabel = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 28px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 10px;
  margin-bottom: 16px;
`;

const weekDayFormat = (day: Date) => {
  return dayjs(day).format('ddd').charAt(0);
};

export const DatePicker = (
  props: Omit<DatePickerProps<'range'>, 'type' | 'weekdayFormat'>
) => {
  const { value, onChange } = props;
  const isToggleEnabled = value
    ? value[0] === null && value[1] === null
    : false;
  return (
    <CalendarContainer>
      <Header>
        <OnAllTimeContainer>
          <Toggle
            checked={isToggleEnabled}
            onChange={() => {
              if (!onChange) {
                return;
              }
              if (isToggleEnabled) {
                onChange([new Date(), null]);
              } else {
                onChange([null, null]);
              }
            }}
          />
          <OnAllTimeLabel>On all the time</OnAllTimeLabel>
        </OnAllTimeContainer>
      </Header>
      <StyledInfoLabel>Rule Start - End dates</StyledInfoLabel>
      <StyledDateRangeLabel>
        {props.value ? formatMonthDayDateRange(props.value) : ''}
      </StyledDateRangeLabel>
      <StyledDatePicker {...props} type="range" weekdayFormat={weekDayFormat} />
    </CalendarContainer>
  );
};
