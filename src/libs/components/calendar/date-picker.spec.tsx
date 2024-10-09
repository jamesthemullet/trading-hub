import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';

import dayjs from 'dayjs';

import { DatePicker } from './date-picker';

describe('date-picker', () => {
  it('should render', () => {
    render(
      <MantineProvider>
        <DatePicker />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();
    expect(screen.getByText('On all the time')).toBeInTheDocument();
  });

  it('should call onChange', () => {
    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePicker onChange={mockOnChange} value={[null, null]} />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();
    screen.getByTitle('Toggle').click();
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('should call onChange with value', () => {
    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePicker
          onChange={mockOnChange}
          value={[dayjs('2021-01-01').toDate(), dayjs('2021-01-31').toDate()]}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();
    screen.getByTitle('Toggle').click();
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('should be able to select start and end time', async () => {
    const user = userEvent.setup();
    const mockSetStartTime = jest.fn();
    const mockSetEndTime = jest.fn();
    render(
      <MantineProvider>
        <DatePicker
          value={[dayjs('2021-01-01').toDate(), dayjs('2021-01-31').toDate()]}
          isTimeEnabled
          startTime="00:00"
          endTime="00:00"
          setStartTime={mockSetStartTime}
          setEndTime={mockSetEndTime}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();

    const startTimeInput = screen.getByLabelText('Start time (GMT +1)');
    await user.type(startTimeInput, '1');
    expect(mockSetStartTime).toHaveBeenCalledWith('00:01');

    const endTimeInput = screen.getByLabelText('End time (GMT +1)');
    await user.type(endTimeInput, '2');
    expect(mockSetEndTime).toHaveBeenCalledWith('00:02');
  });
});
