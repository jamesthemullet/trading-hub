import styled from '@emotion/styled';
import { useState } from 'react';
import { createTheme, MantineProvider, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import {
  Button,
  DatePicker,
  formatMonthDayDateRange,
  Input,
} from '@/libs/components';

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

const DatePickerInputContainer = styled.div`
  width: 200px;
`;

export const DateTimePickerModal = ({
  dateTime,
  onUpdateDateTimeRange,
}: {
  dateTime?: [Date, Date];
  onUpdateDateTimeRange?: (dateTime: [Date | null, Date | null]) => void;
}) => {
  const [tempDateRange, setTempDateRange] = useState<
    [Date | null, Date | null]
  >(dateTime || [new Date(), null]);
  const [opened, { open, close }] = useDisclosure(false);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startTime, setStartTime] = useState(
    dateRange?.[0]
      ? `${dateRange[0].getHours()} : ${dateRange[0].getMinutes()}`
      : '00:00'
  );
  const [endTime, setEndTime] = useState(
    dateRange?.[1]
      ? `${dateRange[1].getHours()} : ${dateRange[1].getMinutes()}`
      : '23:59'
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
      <DatePickerInputContainer>
        <Input
          id={''}
          label={''}
          placeholder={'Select date range'}
          value={formatMonthDayDateRange(dateRange)}
          onClick={() => {
            setTempDateRange(dateRange);
            open();
          }}
        ></Input>
      </DatePickerInputContainer>

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
              >
                Save
              </StyledButton>
            </Footer>
          </Modal.Content>
        </Modal.Root>
      </MantineProvider>
    </>
  );
};
