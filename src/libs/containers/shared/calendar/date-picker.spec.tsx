import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';

import dayjs from 'dayjs';

import { DatePicker, toDateRange } from './date-picker';

describe('date-picker', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('converts empty date ranges to null dates', () => {
    expect(toDateRange(null)).toEqual([null, null]);
    expect(toDateRange([null, null])).toEqual([null, null]);
  });

  it('converts date range values to dates', () => {
    expect(toDateRange(['2021-01-01', '2021-01-31'])).toEqual([
      new Date('2021-01-01'),
      new Date('2021-01-31'),
    ]);
  });

  it('should  render', () => {
    render(
      <MantineProvider>
        <DatePicker onChange={jest.fn()} />
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
    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePicker
          value={[dayjs('2021-01-01').toDate(), dayjs('2021-01-31').toDate()]}
          isTimeEnabled
          startTime="00:00"
          endTime="00:00"
          setStartTime={mockSetStartTime}
          setEndTime={mockSetEndTime}
          onChange={mockOnChange}
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

  it('should call with start time if end time before start time on the same date', async () => {
    const user = userEvent.setup();
    const mockSetStartTime = jest.fn();
    const mockSetEndTime = jest.fn();
    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePicker
          value={[dayjs('2021-01-01').toDate(), dayjs('2021-01-01').toDate()]}
          isTimeEnabled
          startTime="00:03"
          endTime="00:00"
          setStartTime={mockSetStartTime}
          setEndTime={mockSetEndTime}
          onChange={mockOnChange}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();

    const endTimeInput = screen.getByLabelText('End time (GMT +1)');
    await user.type(endTimeInput, '2');
    expect(mockSetEndTime).toHaveBeenCalledWith('00:03');
  });

  it('should be able to open time pickers', async () => {
    const user = userEvent.setup();
    const mockSetStartTime = jest.fn();
    const mockSetEndTime = jest.fn();
    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePicker
          value={[dayjs('2021-01-01').toDate(), dayjs('2021-01-31').toDate()]}
          isTimeEnabled
          startTime="00:00"
          endTime="00:00"
          setStartTime={mockSetStartTime}
          setEndTime={mockSetEndTime}
          onChange={mockOnChange}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();

    const startTimeInput = screen.getByLabelText('Start time (GMT +1)');

    (startTimeInput as HTMLInputElement).showPicker = jest.fn();
    await user.type(startTimeInput, '1');
    expect(mockSetStartTime).toHaveBeenCalledWith('00:01');

    const startAction = screen.getByLabelText('Open edit start time selection');
    await user.click(startAction);

    const endTimeInput = screen.getByLabelText('End time (GMT +1)');
    (endTimeInput as HTMLInputElement).showPicker = jest.fn();
    await user.type(endTimeInput, '2');

    const endAction = screen.getByLabelText('Open edit end time selection');
    await user.click(endAction);

    expect(mockSetEndTime).toHaveBeenCalledWith('00:02');
  });
});
