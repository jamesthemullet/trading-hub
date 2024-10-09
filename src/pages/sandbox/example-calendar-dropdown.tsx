import { Input, DatePicker, formatMonthDayDateRange } from '@/libs/components';
import styled from '@emotion/styled';
import { MantineProvider, Popover, createTheme } from '@mantine/core';
import { useState } from 'react';

const theme = createTheme({});

const DatePickerInputContainer = styled.div`
  width: 200px;
`;

const CalendarContainer = styled.div`
  height: 520px;
  overflow: hidden;
`;

const StyledPopoverDropdown = styled(Popover.Dropdown)`
  background-color: #fbf6f4;
`;

export const ExampleCalendarDropdown = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(),
    null,
  ]);
  return (
    <MantineProvider theme={theme}>
      <Popover position="bottom" withArrow shadow="md" trapFocus>
        <Popover.Target>
          <DatePickerInputContainer>
            <Input
              id={''}
              label={''}
              placeholder={'Select date range'}
              value={formatMonthDayDateRange(dateRange)}
            ></Input>
          </DatePickerInputContainer>
        </Popover.Target>
        <StyledPopoverDropdown>
          <CalendarContainer>
            <DatePicker value={dateRange} onChange={setDateRange} />
          </CalendarContainer>
        </StyledPopoverDropdown>
      </Popover>
    </MantineProvider>
  );
};
