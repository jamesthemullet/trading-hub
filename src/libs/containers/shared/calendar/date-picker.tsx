import styled from '@emotion/styled';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import { ActionIcon } from '@mantine/core';
import type { DatePickerProps } from '@mantine/dates';
import { DatePicker as MantineDatePicker } from '@mantine/dates';

import { Toggle } from '@/libs/components/toggle/toggle';
import { color } from '@/libs/utils/constants';

import dayjs from 'dayjs';
import Image from 'next/image';

import {
  CalendarContainer,
  Content,
  Header,
  OnAllTimeContainer,
  OnAllTimeLabel,
  StyledInfoContainer,
  StyledInfoLabel,
  StyledTimeInput,
  StyledTimeInputGroup,
  StyledValueLabel,
} from './date-picker.styles';
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
    background-color: ${color.accent.primary.primary};
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

const weekDayFormat = (day: string) => {
  return dayjs(day).format('ddd').charAt(0);
};

export const DatePicker = (
  props: {
    onChange: (value: [Date | null, Date | null]) => void;
    isTimeEnabled?: boolean;
    startTime?: string;
    endTime?: string;
    setStartTime?: (time: string) => void;
    setEndTime?: (time: string) => void;
  } & Omit<DatePickerProps<'range'>, 'onChange'>
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
      value?.[0] &&
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

        <StyledValueLabel as={value && !isToggleEnabled ? 'time' : 'span'}>
          {isToggleEnabled
            ? 'All the time'
            : props.value
              ? formatMonthDayDateTimeRange(props.value, startTime, endTime)
              : ''}
        </StyledValueLabel>
      </StyledInfoContainer>

      <Content isDisabled={isToggleEnabled}>
        <StyledDatePicker
          allowSingleDateInRange
          size="sm"
          numberOfColumns={2}
          type="range"
          weekdayFormat={weekDayFormat}
          value={value}
          onChange={(val: [string | null, string | null] | null) =>
            onChange([
              // istanbul ignore next
              val?.[0] ? new Date(val[0]) : null,
              val?.[1] ? new Date(val[1]) : null,
            ])
          }
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
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setStartTime?.(event.currentTarget.value)
              }
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
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
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
