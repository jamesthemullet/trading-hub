import styled from '@emotion/styled';
import { useRef } from 'react';
import { ActionIcon } from '@mantine/core';
import {
  DatePicker as MantineDatePicker,
  DatePickerProps,
  TimeInput,
} from '@mantine/dates';

import dayjs from 'dayjs';
import Image from 'next/image';

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
  align-items: center;
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

const StyledvalueLabel = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 20px;
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

  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const isToggleEnabled = value
    ? value[0] === null && value[1] === null
    : false;

  const handleSetEndTime = (time: string) => {
    if (
      value &&
      value[0] &&
      value[1] &&
      startTime &&
      dayjs(value[0]).format('DD-MM-YYYY') ===
        dayjs(value[1]).format('DD-MM-YYYY') &&
      time < startTime
    ) {
      return setEndTime?.(startTime);
    }
    setEndTime?.(time);
  };

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
        <StyledInfoLabel as="h4">Rule date and time duration</StyledInfoLabel>

        <StyledvalueLabel>
          {isToggleEnabled
            ? 'All the time'
            : props.value
              ? formatMonthDayDateTimeRange(props.value, startTime, endTime)
              : ''}
        </StyledvalueLabel>
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
              ref={startTimeRef}
              rightSection={
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label="Open edit start time selection"
                  onClick={() => startTimeRef.current?.showPicker()}
                >
                  <Image
                    src="/trading-hub/asset/icon-clock.svg"
                    width="16"
                    height="16"
                    alt=""
                  />
                </ActionIcon>
              }
            />

            <StyledTimeInput
              label="End time (GMT +1)"
              radius="xs"
              maxTime="23:59"
              value={endTime}
              disabled={value?.[1] === null}
              onChange={(event) =>
                handleSetEndTime?.(event.currentTarget.value)
              }
              ref={endTimeRef}
              rightSection={
                <ActionIcon
                  disabled={value?.[1] === null}
                  variant="subtle"
                  color="gray"
                  aria-label="Open edit end time selection"
                  onClick={() => endTimeRef.current?.showPicker()}
                >
                  <Image
                    src="/trading-hub/asset/icon-clock.svg"
                    width="16"
                    height="16"
                    alt=""
                  />
                </ActionIcon>
              }
            />
          </StyledTimeInputGroup>
        )}
      </Content>
    </CalendarContainer>
  );
};
