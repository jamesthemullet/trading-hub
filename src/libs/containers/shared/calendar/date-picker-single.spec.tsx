import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';

import dayjs from 'dayjs';

import { DatePickerSingle } from './date-picker-single';

describe('date-picker', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should render', () => {
    render(
      <MantineProvider>
        <DatePickerSingle
          startTime="00:00"
          setStartTime={jest.fn()}
          onChange={jest.fn()}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();
    expect(screen.getByText('On all the time')).toBeInTheDocument();
  });

  it('should call onChange', () => {
    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePickerSingle
          startTime="00:00"
          setStartTime={jest.fn()}
          onChange={mockOnChange}
          value={null}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();
    screen.getByTitle('Toggle').click();
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('should call onChange with value', () => {
    jest.useFakeTimers().setSystemTime(new Date('2021-01-01'));

    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePickerSingle
          startTime="00:00"
          setStartTime={jest.fn()}
          onChange={mockOnChange}
          value={dayjs('2021-01-01').toDate()}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();
    screen.getByTitle('Toggle').click();
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledTimes(2);

    screen.getByLabelText('2 January 2021').click();
    expect(mockOnChange).toHaveBeenCalledWith(dayjs('2021-01-02').toDate());
  });

  it('should be able to select start time', async () => {
    const user = userEvent.setup();
    const mockSetStartTime = jest.fn();
    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePickerSingle
          value={dayjs('2021-01-01').toDate()}
          startTime="00:00"
          setStartTime={mockSetStartTime}
          onChange={mockOnChange}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();

    const startTimeInput = screen.getByLabelText('Start time (GMT +1)');
    await user.type(startTimeInput, '1');
    expect(mockSetStartTime).toHaveBeenCalledWith('00:01');
  });

  it('calls the html input time picker', async () => {
    const user = userEvent.setup();
    const mockSetStartTime = jest.fn();
    const mockTimeSelect = jest.fn();
    const mockOnChange = jest.fn();
    render(
      <MantineProvider>
        <DatePickerSingle
          value={dayjs('2021-01-01').toDate()}
          startTime="00:00"
          setStartTime={mockSetStartTime}
          onChange={mockOnChange}
        />
      </MantineProvider>
    );
    screen.getByTitle('Toggle').click();

    const startTimeInput = screen.getByLabelText('Start time (GMT +1)');

    (startTimeInput as HTMLInputElement).showPicker = mockTimeSelect;
    await user.type(startTimeInput, '1');
    expect(mockSetStartTime).toHaveBeenCalledWith('00:01');

    const startAction = screen.getByLabelText('Open edit start time selection');
    await user.click(startAction);

    expect(mockTimeSelect).toHaveBeenCalled();
  });
});
