import styled from '@emotion/styled';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import { ActionIcon } from '@mantine/core';
import type { DatePickerProps } from '@mantine/dates';
import { DatePicker as MantineDatePicker } from '@mantine/dates';

import { Toggle } from '@/libs/components/toggle/toggle';
import { color } from '@/libs/components/utils/constants';

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

const StyledDatePicker = styled(MantineDatePicker<'default'>)`
  & .mantine-DatePicker-day[data-outside='true'] {
    opacity: 0;
  }

  & .mantine-DatePicker-day[data-weekend='true'] {
    color: #000000;
  }

  & .mantine-DatePicker-day[data-weekend='true']:where([data-selected]),
  & .mantine-DatePicker-day:where([data-selected]) {
    color: #ffffff;
    background-color: transparent;
    position: relative;
    z-index: 1;
  }
  & .mantine-DatePicker-day:where([data-selected])::before {
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

  & .mantine-DatePicker-weekday {
    color: #000000;
  }
`;

const weekDayFormat = (day: Date) => {
  return dayjs(day).format('ddd').charAt(0);
};

export const DatePickerSingle = ({
  value,
  onChange,
  startTime,
  setStartTime,
  ...datePickerProps
}: {
  startTime: string;
  setStartTime: (time: string) => void;
  onChange: (val: Date | null) => void;
} & Omit<DatePickerProps<'default'>, 'onChange'>) => {
  const startTimeRef = useRef<HTMLInputElement>(null);

  const isToggleEnabled = value === null;

  // istanbul ignore next
  const handleChange = (val: string | null) =>
    onChange(val ? new Date(val) : null);

  return (
    <CalendarContainer>
      <Header>
        <OnAllTimeContainer>
          <Toggle
            checked={isToggleEnabled}
            onChange={() => {
              if (isToggleEnabled) {
                onChange(new Date());
              } else {
                onChange(null);
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
            : value
              ? formatMonthDayDateTimeRange([value, null], startTime)
              : ''}
        </StyledValueLabel>
      </StyledInfoContainer>

      <Content isDisabled={isToggleEnabled}>
        <StyledDatePicker
          size="sm"
          numberOfColumns={2}
          type="default"
          weekdayFormat={(date: string) => weekDayFormat(new Date(date))}
          value={value}
          onChange={handleChange}
          minDate={new Date()}
          {...datePickerProps}
        />

        <StyledTimeInputGroup>
          <StyledTimeInput
            label="Start time (GMT +1)"
            radius="xs"
            minTime="00:00"
            value={startTime}
            disabled={value === null}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setStartTime(event.currentTarget.value)
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
            value="00:00"
            disabled
            rightSection={
              <ActionIcon disabled variant="subtle" color="gray">
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
      </Content>
    </CalendarContainer>
  );
};
