import {
  Button,
  DatePicker,
  Input,
  formatMonthDayDateRange,
} from '@/libs/components';
import styled from '@emotion/styled';
import { MantineProvider, Modal, createTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

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
`;

const DatePickerInputContainer = styled.div`
  width: 200px;
`;

export const ExampleCalendarModal = () => {
  const [tempDateRange, setTempDateRange] = useState<
    [Date | null, Date | null]
  >([new Date(), null]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(),
    null,
  ]);
  const [opened, { open, close }] = useDisclosure(false);
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
        <Modal.Root opened={opened} onClose={close} withinPortal={true}>
          <Modal.Overlay backgroundOpacity={0.3} blur={3} />
          <Modal.Content>
            <StyledModalBody>
              <DatePicker
                size="xl"
                value={tempDateRange}
                onChange={setTempDateRange}
              />
            </StyledModalBody>
            <Footer>
              <StyledButton onClick={close}>Cancel</StyledButton>
              <StyledButton
                onClick={() => {
                  setDateRange(tempDateRange);
                  close();
                }}
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
