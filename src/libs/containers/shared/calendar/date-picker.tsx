import type { ChangeEvent, ReactElement } from 'react';
import { useRef } from 'react';
import { ActionIcon } from '@mantine/core';
import type { DatePickerProps } from '@mantine/dates';
import { DatePicker as MantineDatePicker, TimeInput } from '@mantine/dates';

import { Typography } from '@/libs/components';
import { Toggle } from '@/libs/components/toggle/toggle';

import dayjs from 'dayjs';
import Image from 'next/image';

import styles from './date-picker.module.css';
import { formatMonthDayDateTimeRange } from './format-date-range';

const weekDayFormat = (day: string) => {
  return dayjs(day).format('ddd').charAt(0);
};

const calendarAriaLabels = {
  previous: 'Go to previous month',
  next: 'Go to next month',
};

export const toDateRange = (
  value: [string | null, string | null] | null
): [Date | null, Date | null] => [
  value?.[0] ? new Date(value[0]) : null,
  value?.[1] ? new Date(value[1]) : null,
];

export const DatePicker = (
  props: {
    onChange: (value: [Date | null, Date | null]) => void;
    isTimeEnabled?: boolean;
    startTime?: string;
    endTime?: string;
    setStartTime?: (time: string) => void;
    setEndTime?: (time: string) => void;
  } & Omit<DatePickerProps<'range'>, 'onChange'>
): ReactElement => {
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

  let valueLabelContent = '';

  if (isToggleEnabled) {
    valueLabelContent = 'All the time';
  } else if (value) {
    valueLabelContent = formatMonthDayDateTimeRange(value, startTime, endTime);
  }

  const shouldRenderTimeElement = Boolean(value) && !isToggleEnabled;

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
    <div className={styles.datepickerContainer}>
      <div className={styles.datepickerHeader}>
        <div className={styles.onAllTimeContainer}>
          <Toggle
            checked={isToggleEnabled}
            aria-label="On all the time"
            onChange={() => {
              if (isToggleEnabled) {
                onChange([new Date(), null]);
              } else {
                onChange([null, null]);
              }
            }}
          />
          <Typography>On all the time</Typography>
        </div>
      </div>

      <div className={styles.infoContainer}>
        <Typography as="h2">Rule date and time duration</Typography>
        {shouldRenderTimeElement ? (
          <Typography variant="titleSmall" as="time">
            {valueLabelContent}
          </Typography>
        ) : (
          <Typography variant="titleSmall" as="span">
            {valueLabelContent}
          </Typography>
        )}
      </div>

      <div
        className={styles.datepickerContent}
        data-is-disabled={isToggleEnabled}
      >
        <MantineDatePicker
          className={styles.mantineDatepicker}
          allowSingleDateInRange
          size="sm"
          numberOfColumns={2}
          type="range"
          weekdayFormat={weekDayFormat}
          value={value}
          previousLabel={calendarAriaLabels.previous}
          nextLabel={calendarAriaLabels.next}
          onChange={(val: [string | null, string | null] | null) =>
            onChange(toDateRange(val))
          }
          minDate={new Date()}
          {...datePickerProps}
        />

        {isTimeEnabled && (
          <div className={styles.timeInputGroup}>
            <TimeInput
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

            <TimeInput
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
          </div>
        )}
      </div>
    </div>
  );
};
