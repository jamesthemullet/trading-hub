import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
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
});
