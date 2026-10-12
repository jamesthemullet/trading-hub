import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

import { DatePicker } from './date-picker';

jest.mock('@mantine/dates', () => ({
  ...jest.requireActual('@mantine/dates'),
  DatePicker: ({
    onChange,
  }: {
    onChange: (value: [string | null, string | null] | null) => void;
  }) => (
    <div>
      <input
        type="button"
        value="Clear range"
        onClick={() => onChange(null)}
      />
      <input
        type="button"
        value="Select start date"
        onClick={() => onChange(['2026-01-01', null])}
      />
      <input
        type="button"
        value="Select date range"
        onClick={() => onChange(['2026-01-01', '2026-01-02'])}
      />
    </div>
  ),
}));

describe('date-picker range changes', () => {
  it('converts empty, partial, and complete date ranges to Date values', () => {
    const onChange = jest.fn();
    render(
      <MantineProvider>
        <DatePicker onChange={onChange} />
      </MantineProvider>
    );

    screen.getByRole('button', { name: 'Clear range' }).click();
    expect(onChange).toHaveBeenLastCalledWith([null, null]);

    screen.getByRole('button', { name: 'Select start date' }).click();
    expect(onChange).toHaveBeenLastCalledWith([
      new Date('2026-01-01'),
      null,
    ]);

    screen.getByRole('button', { name: 'Select date range' }).click();
    expect(onChange).toHaveBeenLastCalledWith([
      new Date('2026-01-01'),
      new Date('2026-01-02'),
    ]);
  });
});
