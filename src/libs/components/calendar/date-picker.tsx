import styled from '@emotion/styled';
import {
  DatePicker as MantineDatePicker,
  DatePickerProps,
  TimeInput,
} from '@mantine/dates';

import dayjs from 'dayjs';

import { Toggle } from '../toggle/toggle';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { formatMonthDayDateTimeRange } from './format-date-range';

const StyledDatePicker = styled(MantineDatePicker<'range'>)`
  & .mantine-DatePicker-day[data-outside='true'] {
    opacity: 0;
  }

  & .mantine-DatePicker-day[data-weekend='true'] {
    color: #000000;
  }

  & .mantine-DatePicker-day[data-in-range] {
    background: ${color.lightGreen};
  }

  & .mantine-DatePicker-day[data-first-in-range],
  & .mantine-DatePicker-day[data-last-in-range] {
    color: #ffffff;
    background-color: transparent;
    position: relative;
    z-index: 1;
  }
  & .mantine-DatePicker-day[data-first-in-range]::before,
  & .mantine-DatePicker-day[data-last-in-range]::before {
    content: '';
    position: absolute;
    background-color: ${color.darkHeritageGreen};
    border-radius: 50%;
    top: 0;
    bottom: 0;
    left: 0%;
    right: 0;
    z-index: -1;
  }
  & .mantine-DatePicker-day[data-first-in-range]::after {
    content: '';
    position: absolute;
    background-color: ${color.lightGreen};
    top: 0;
    bottom: 0;
    left: 50%;
    right: 0;
    z-index: -2;
  }
  & .mantine-DatePicker-day[data-last-in-range]::after {
    content: '';
    position: absolute;
    background-color: ${color.lightGreen};
    top: 0;
    bottom: 0;
    right: 50%;
    left: 0;
    z-index: -2;
  }
  & .mantine-DatePicker-day[data-first-in-range][data-last-in-range]::after {
    content: '';
    display: none;
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
  margin: ${spacing(2)};
`;

const StyledInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${spacing(2)} 0;
  margin-bottom: ${spacing(2)};
  border-top: 1px solid ${color.grey};
  border-bottom: 1px solid ${color.grey};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  ${(props: { disabled: boolean }) =>
    props.disabled
      ? `
        pointer-events: none;
        opacity: 0.5;
      `
      : ''}
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
  margin-bottom: ${spacing(2)};
`;

const StyledDateRangeLabel = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 28px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 10px;
`;

const StyledTimeInputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin: ${spacing(2)} 0;
`;
const StyledTimeInput = styled(TimeInput)`
  width: 250px;
`;

const weekDayFormat = (day: Date) => {
  return dayjs(day).format('ddd').charAt(0);
};

export const DatePicker = (
  props: {
    isTimeEnabled?: boolean;
    startTime?: string;
    endTime?: string;
    setStartTime?: (time: string) => void;
    setEndTime?: (time: string) => void;
  } & DatePickerProps<'range'>
) => {
  const {
    value,
    onChange,
    isTimeEnabled,
    startTime,
    endTime,
    setStartTime,
    setEndTime,
    ...datePickerProps
  } = props;

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

      <StyledInfoContainer>
        <StyledInfoLabel>Rule date and time duration</StyledInfoLabel>

        <StyledDateRangeLabel>
          {isToggleEnabled
            ? 'All the time'
            : props.value
              ? formatMonthDayDateTimeRange(props.value, startTime, endTime)
              : ''}
        </StyledDateRangeLabel>
      </StyledInfoContainer>

      <Content disabled={isToggleEnabled}>
        <StyledDatePicker
          allowSingleDateInRange
          size="sm"
          numberOfColumns={2}
          type="range"
          weekdayFormat={weekDayFormat}
          value={value}
          onChange={onChange}
          minDate={new Date()}
          {...datePickerProps}
        />

        {isTimeEnabled && (
          <StyledTimeInputGroup>
            <StyledTimeInput
              label="Start time (GMT +1)"
              radius="xs"
              minTime="00:00"
              value={startTime}
              disabled={value?.[0] === null}
              onChange={(event) => setStartTime?.(event.currentTarget.value)}
            />

            <StyledTimeInput
              label="End time (GMT +1)"
              radius="xs"
              maxTime="23:59"
              value={endTime}
              disabled={value?.[1] === null}
              onChange={(event) => setEndTime?.(event.currentTarget.value)}
            />
          </StyledTimeInputGroup>
        )}
      </Content>
    </CalendarContainer>
  );
};
