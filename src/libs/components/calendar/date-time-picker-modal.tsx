import styled from '@emotion/styled';
import { useState } from 'react';
import { createTheme, MantineProvider, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import {
  Button,
  DatePicker,
  formatDateMonthYearTimeRange,
  Input,
  spacing,
} from '@/libs/components';

import dayjs from 'dayjs';
import Image from 'next/image';

const theme = createTheme({});

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
  height: 54px;
`;

const StyledInputContainer = styled.div`
  background-color: #f5f5f5;
  border-bottom: solid 1px #cacaca;
  width: 316px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${spacing(1)};
`;

export const DateTimePickerModal = ({
  dateTime,
  onUpdateDateTimeRange,
  label,
  showCalendarIcon,
}: {
  dateTime?: [Date | null, Date | null];
  onUpdateDateTimeRange?: (dateTime: [Date | null, Date | null]) => void;
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
  const [startTime, setStartTime] = useState(
    dateRange?.[0] ? dayjs(dateRange[0]).format('HH:mm') : '00:00'
  );
  const [endTime, setEndTime] = useState(
    dateRange?.[1] ? dayjs(dateRange[1]).format('HH:mm') : '23:59'
  );

  const handleSave = () => {
    const startDate = tempDateRange[0];
    const endDate = tempDateRange[1];

    if (startTime) {
      startDate?.setHours(Number(startTime.split(':')[0]));
      startDate?.setMinutes(Number(startTime.split(':')[1]));
    }

    if (endTime) {
      endDate?.setHours(Number(endTime.split(':')[0]));
      endDate?.setMinutes(Number(endTime.split(':')[1]));
    }

    setDateRange([startDate, endDate]);
    onUpdateDateTimeRange?.([startDate, endDate]);
    close();
  };

  return (
    <>
      <StyledInputContainer>
        <StyledInput
          id={''}
          label={label || ''}
          placeholder={'Select date range'}
          value={formatDateMonthYearTimeRange(dateRange, startTime, endTime)}
          onClick={() => {
            setTempDateRange(dateRange);
            open();
          }}
          isLabelHidden={true}
        ></StyledInput>

        {showCalendarIcon && (
          <Image
            alt=""
            src={`/trading-hub/asset/icon-blank-calendar.svg`}
            width={20}
            height={20}
          />
        )}
      </StyledInputContainer>

      <MantineProvider theme={theme}>
        <Modal.Root
          opened={opened}
          onClose={close}
          size="auto"
          withinPortal={true}
        >
          <Modal.Overlay backgroundOpacity={0.3} blur={3} />
          <Modal.Content>
            <StyledModalBody>
              <DatePicker
                value={tempDateRange}
                onChange={setTempDateRange}
                isTimeEnabled
                startTime={startTime}
                endTime={endTime}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
              />
            </StyledModalBody>

            <Footer>
              <StyledButton theme="tertiary" onClick={close}>
                Cancel
              </StyledButton>
              <StyledButton
                theme="tertiary"
                isDisabled={
                  tempDateRange[0] !== null && tempDateRange[1] === null
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
