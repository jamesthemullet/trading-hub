import { render, screen } from '@testing-library/react';
import { Button, MantineProvider } from '@mantine/core';

import { DatePicker } from './date-picker';

jest.mock('@mantine/dates', () => {
  const mantineDates = jest.requireActual('@mantine/dates');

  return {
    ...mantineDates,
    DatePicker: ({
      onChange,
    }: {
      onChange: (value: [string | null, string | null] | null) => void;
    }) => (
      <>
        <Button onClick={() => onChange(null)}>Return an empty range</Button>
        <Button onClick={() => onChange(['2024-01-01', null])}>
          Return a start-only range
        </Button>
        <Button onClick={() => onChange(['2024-01-01', '2024-01-02'])}>
          Return a full range
        </Button>
      </>
    ),
  };
});

describe('date-picker null range', () => {
  it('converts null and partial picker values into date ranges', () => {
    const onChange = jest.fn();

    render(
      <MantineProvider>
        <DatePicker
          value={[new Date('2024-01-01'), new Date('2024-01-02')]}
          onChange={onChange}
        />
      </MantineProvider>
    );

    screen.getByRole('button', { name: 'Return an empty range' }).click();
    screen.getByRole('button', { name: 'Return a start-only range' }).click();
    screen.getByRole('button', { name: 'Return a full range' }).click();

    expect(onChange).toHaveBeenNthCalledWith(1, [null, null]);
    expect(onChange).toHaveBeenNthCalledWith(2, [new Date('2024-01-01'), null]);
    expect(onChange).toHaveBeenNthCalledWith(3, [
      new Date('2024-01-01'),
      new Date('2024-01-02'),
    ]);
  });
});
