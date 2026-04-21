import { useState } from 'react';
import { MantineProvider, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Button } from '@/libs/components';
import { Checkbox } from '@/libs/components/checkboxes/checkbox';
import { Input } from '@/libs/containers/shared';

import dayjs from 'dayjs';
import Image from 'next/image';

import { DatePicker } from './date-picker';
import datepickerStyles from './date-picker.module.css';
import { DatePickerSingle } from './date-picker-single';
import styles from './date-time-picker-modal.module.css';
import { formatDateMonthYearTimeRange } from './format-date-range';

export const DateTimePickerModal = ({
  dateTime,
  onUpdateDateTimeRange,
  label,
  showCalendarIcon,
  isWriteEnabled,
}: {
  dateTime?: [Date | null, Date | null];
  onUpdateDateTimeRange: (dateTime: [Date | null, Date | null]) => void;
  isWriteEnabled: boolean;
  label?: string;
  showCalendarIcon?: boolean;
}) => {
  const [tempDateRange, setTempDateRange] = useState<
    [Date | null, Date | null]
  >(dateTime || [new Date(), null]);
  const [opened, { open, close }] = useDisclosure(false);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(
    dateTime || [null, null]
  );
  const [hasDateRange, setHasDateRange] = useState(
    dateTime && dateTime[0] !== null && dateTime[1] === null ? false : true
  );
  const [startTime, setStartTime] = useState(
    dateRange?.[0] ? dayjs(dateRange[0]).format('HH:mm') : '00:00'
  );
  const [endTime, setEndTime] = useState(
    dateRange?.[1] ? dayjs(dateRange[1]).format('HH:mm') : '23:59'
  );

  const handleSave = () => {
    const startDate = tempDateRange[0];
    const endDate = hasDateRange ? tempDateRange[1] : null;

    // istanbul ignore else
    if (startTime) {
      startDate?.setHours(Number(startTime.split(':')[0]));
      startDate?.setMinutes(Number(startTime.split(':')[1]));
    }

    // istanbul ignore else
    if (endTime) {
      endDate?.setHours(Number(endTime.split(':')[0]));
      endDate?.setMinutes(Number(endTime.split(':')[1]));
    }

    setDateRange([startDate, endDate]);
    onUpdateDateTimeRange?.([startDate, endDate]);
    close();
  };

  const openDatePicker = () => {
    setTempDateRange(dateRange);
    open();
  };

  return (
    <>
      <div className={styles.styledInputContainer}>
        <Input
          className={styles.styledInput}
          id=""
          label={label || ''}
          placeholder="Select date range"
          value={formatDateMonthYearTimeRange(
            dateRange,
            startTime,
            endTime,
            true
          )}
          {...(isWriteEnabled && { onClick: openDatePicker })}
          isLabelHidden
          readOnly={!isWriteEnabled}
          aria-label="Select date range"
        />

        {showCalendarIcon && (
          <div className={styles.calendarIconContainer}>
            <Image
              alt=""
              src="/trading-hub/asset/icon-blank-calendar.svg"
              width={20}
              height={20}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <MantineProvider>
        <Modal.Root opened={opened} onClose={close} size="auto" withinPortal>
          <Modal.Overlay backgroundOpacity={0.3} blur={3} />
          <Modal.Content
            role="dialog"
            aria-modal="true"
            aria-label="Datepicker modal"
          >
            <Modal.Body className={styles.styledModalBody}>
              {hasDateRange ? (
                <DatePicker
                  value={tempDateRange}
                  onChange={setTempDateRange}
                  isTimeEnabled
                  startTime={startTime}
                  endTime={endTime}
                  setStartTime={setStartTime}
                  setEndTime={setEndTime}
                />
              ) : (
                <DatePickerSingle
                  value={tempDateRange[0]}
                  onChange={(val) => setTempDateRange([val, null])}
                  startTime={startTime}
                  setStartTime={setStartTime}
                />
              )}

              <div
                className={datepickerStyles.datepickerContent}
                data-is-disabled={tempDateRange[0] === null}
              >
                <div className={styles.rangeSelector}>
                  <Checkbox
                    label="No end date"
                    shouldShowLabel
                    checked={!hasDateRange}
                    onChange={() => setHasDateRange(!hasDateRange)}
                  />
                </div>
              </div>
            </Modal.Body>

            <div className={styles.footer}>
              <Button theme="tertiary" onClick={close}>
                Cancel
              </Button>
              <Button
                theme="tertiary"
                isDisabled={
                  tempDateRange[0] !== null &&
                  hasDateRange &&
                  tempDateRange[1] === null
                }
                onClick={handleSave}
                aria-label="Close schedule editor"
              >
                Done
              </Button>
            </div>
          </Modal.Content>
        </Modal.Root>
      </MantineProvider>
    </>
  );
};
