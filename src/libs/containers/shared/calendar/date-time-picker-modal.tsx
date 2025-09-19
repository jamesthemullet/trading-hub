import styled from '@emotion/styled';
import { useState } from 'react';
import { MantineProvider, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Button, Input, spacing } from '@/libs/components';
import { Checkbox } from '@/libs/components/checkboxes/checkbox';
import { color } from '@/libs/components/utils/constants';

import dayjs from 'dayjs';
import Image from 'next/image';

import { DatePicker } from './date-picker';
import { Content } from './date-picker.styles';
import { DatePickerSingle } from './date-picker-single';
import { formatDateMonthYearTimeRange } from './format-date-range';

const StyledModalBody = styled(Modal.Body)`
  background-color: #fbf6f4;
`;

const Footer = styled.div`
  display: flex;
  border-top: 1px solid black;
  padding: 16px;
  gap: 16px;

  & > Button:first-of-type {
    margin-left: auto;
  }
`;

const StyledButton = styled(Button)`
  align-self: flex-start;
  width: 96px;
  border-radius: 20px;
`;

const StyledInput = styled(Input)`
  background-color: #f5f5f5;
  border: none;
  height: 56px;
  border-radius: 4px 4px 0 0;
  padding-right: ${spacing(6)};
  cursor: pointer;
`;

const StyledInputContainer = styled.div`
  background-color: #f5f5f5;
  border-bottom: 1px solid ${color.role.outline.outline};
  width: 316px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${spacing(1)};
  border-radius: 4px 4px 0 0;
  position: relative;
`;

const RangeSelector = styled.div`
  display: flex;
  align-items: end;
  justify-content: right;
  padding-right: 150px;
`;

const CalendarIconContainer = styled.div`
  position: absolute;
  right: ${spacing(1)};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DateTimePickerModal = ({
  dateTime,
  onUpdateDateTimeRange,
  label,
  showCalendarIcon,
  writeEnabled,
}: {
  dateTime?: [Date | null, Date | null];
  onUpdateDateTimeRange: (dateTime: [Date | null, Date | null]) => void;
  writeEnabled: boolean;
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
      <StyledInputContainer>
        <StyledInput
          id=""
          label={label || ''}
          placeholder="Select date range"
          value={formatDateMonthYearTimeRange(
            dateRange,
            startTime,
            endTime,
            true
          )}
          {...(writeEnabled && { onClick: openDatePicker })}
          isLabelHidden
          readOnly={!writeEnabled}
          aria-label={label || 'Select date range'}
        />

        {showCalendarIcon && (
          <CalendarIconContainer>
            <Image
              alt=""
              src="/trading-hub/asset/icon-blank-calendar.svg"
              width={20}
              height={20}
              aria-hidden="true"
            />
          </CalendarIconContainer>
        )}
      </StyledInputContainer>

      <MantineProvider>
        <Modal.Root
          opened={opened}
          onClose={close}
          size="auto"
          withinPortal
          role="dialog"
          aria-modal="true"
          aria-label="Datepicker modal"
        >
          <Modal.Overlay backgroundOpacity={0.3} blur={3} />
          <Modal.Content>
            <StyledModalBody>
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

              <Content isDisabled={tempDateRange[0] === null}>
                <RangeSelector>
                  <Checkbox
                    label="No end date"
                    showLabel
                    checked={!hasDateRange}
                    onChange={() => setHasDateRange(!hasDateRange)}
                  />
                </RangeSelector>
              </Content>
            </StyledModalBody>

            <Footer>
              <StyledButton theme="tertiary" onClick={close}>
                Cancel
              </StyledButton>
              <StyledButton
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
              </StyledButton>
            </Footer>
          </Modal.Content>
        </Modal.Root>
      </MantineProvider>
    </>
  );
};
