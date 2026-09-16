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

const weekDayFormat = (day: Date) => {
  return dayjs(day).format('ddd').charAt(0);
};

const calendarAriaLabels = {
  previous: 'Go to previous month',
  next: 'Go to next month',
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
} & Omit<DatePickerProps<'default'>, 'onChange'>): ReactElement => {
  const startTimeRef = useRef<HTMLInputElement>(null);

  const isToggleEnabled = value === null;
  let valueLabelText = '';

  if (isToggleEnabled) {
    valueLabelText = 'All the time';
  } else if (value) {
    valueLabelText = formatMonthDayDateTimeRange([value, null], startTime);
  }

  const isTimeValueLabel = Boolean(value) && !isToggleEnabled;

  const handleChange = (val: string | null) =>
    onChange(val ? new Date(val) : null);

  return (
    <div className={styles.datepickerContainer}>
      <div className={styles.datepickerHeader}>
        <div className={styles.onAllTimeContainer}>
          <Toggle
            checked={isToggleEnabled}
            aria-label="On all the time"
            onChange={() => {
              if (isToggleEnabled) {
                onChange(new Date());
              } else {
                onChange(null);
              }
            }}
          />
          <Typography>On all the time</Typography>
        </div>
      </div>

      <div className={styles.infoContainer}>
        <Typography as="h2">Rule date and time duration</Typography>

        {isTimeValueLabel ? (
          <Typography variant="titleSmall" as="time">
            {valueLabelText}
          </Typography>
        ) : (
          <Typography variant="titleSmall">{valueLabelText}</Typography>
        )}
      </div>

      <div
        className={styles.datepickerContent}
        data-is-disabled={isToggleEnabled}
      >
        <MantineDatePicker
          size="sm"
          numberOfColumns={2}
          type="default"
          weekdayFormat={(date: string) => weekDayFormat(new Date(date))}
          value={value}
          previousLabel={calendarAriaLabels.previous}
          nextLabel={calendarAriaLabels.next}
          onChange={handleChange}
          minDate={new Date()}
          {...datePickerProps}
        />

        <div className={styles.timeInputGroup}>
          <TimeInput
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

          <TimeInput
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
        </div>
      </div>
    </div>
  );
};
