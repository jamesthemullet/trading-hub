import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DateTimePickerModal } from './date-time-picker-modal';

describe('DateTimePickerModal', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2022, 2, 1));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should render correctly', async () => {
    render(<DateTimePickerModal />);
    expect(
      screen.queryByRole('button', { name: 'Close schedule editor' })
    ).not.toBeInTheDocument();
    const input = screen.getByPlaceholderText('Select date range');
    act(() => {
      input.click();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Close schedule editor' })
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    act(() => {
      cancelButton.click();
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Close schedule editor' })
      ).not.toBeInTheDocument();
    });
  });

  it('should call save', async () => {
    render(<DateTimePickerModal />);

    const input = screen.getByPlaceholderText('Select date range');
    act(() => {
      input.click();
    });

    // select date range
    await waitFor(() => {
      const startDate = screen.getAllByText('14')[0];
      act(() => {
        startDate.click();
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Mar 14 2022 00:00')).toBeVisible();
    });

    await waitFor(() => {
      const endDate = screen.getAllByText('16')[0];
      act(() => {
        endDate.click();
      });
    });

    const saveButton = screen.getByRole('button', {
      name: 'Close schedule editor',
    });
    act(() => {
      saveButton.click();
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Close schedule editor' })
      ).not.toBeInTheDocument();
    });
    expect((input as HTMLInputElement).value).toBe(
      '14/03/22 00:00 - 16/03/22 23:59'
    );
  });

  it('should be able to select start time', async () => {
    const user = userEvent.setup({ delay: null });
    const onUpdateDateTimeRange = jest.fn();
    render(
      <DateTimePickerModal onUpdateDateTimeRange={onUpdateDateTimeRange} />
    );

    const input = screen.getByPlaceholderText('Select date range');
    act(() => {
      input.click();
    });

    await waitFor(() => {
      const startDate = screen.getAllByText('14')[0];
      act(() => {
        startDate.click();
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Mar 14 2022 00:00')).toBeVisible();
    });

    await waitFor(() => {
      const endDate = screen.getAllByText('16')[0];
      act(() => {
        endDate.click();
      });
    });

    const startTimeInput = screen.getByLabelText('Start time (GMT +1)');
    user.type(startTimeInput, '3');
    user.type(startTimeInput, '0');

    const headerText = await screen.findByText(
      'Mar 14 2022 00:30 - Mar 16 2022 23:59'
    );
    expect(headerText).toBeVisible();

    const saveButton = screen.getByRole('button', {
      name: 'Close schedule editor',
    });
    act(() => {
      saveButton.click();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Close schedule editor' })
      ).not.toBeInTheDocument();
    });

    expect(headerText).not.toBeInTheDocument();

    expect((input as HTMLInputElement).value).toBe(
      '14/03/22 00:30 - 16/03/22 23:59'
    );
    expect(onUpdateDateTimeRange).toHaveBeenCalledWith([
      new Date('2022-03-14T00:30:00.000Z'),
      new Date('2022-03-16T23:59:00.000Z'),
    ]);

    act(() => {
      input.click();
    });

    await waitFor(() => {
      expect(
        screen.getByText('Mar 14 2022 00:30 - Mar 16 2022 23:59')
      ).toBeVisible();
    });
  });

  it('should be able to select end time', async () => {
    const user = userEvent.setup({ delay: null });
    const onUpdateDateTimeRange = jest.fn();
    render(
      <DateTimePickerModal onUpdateDateTimeRange={onUpdateDateTimeRange} />
    );

    const input = screen.getByPlaceholderText('Select date range');
    act(() => {
      input.click();
    });

    // select date range
    await waitFor(() => {
      const startDate = screen.getAllByText('14')[0];
      act(() => {
        startDate.click();
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Mar 14 2022 00:00')).toBeVisible();
    });

    await waitFor(() => {
      const endDate = screen.getAllByText('16')[0];
      act(() => {
        endDate.click();
      });
    });

    const endTimeInput = screen.getByLabelText('End time (GMT +1)');
    user.type(endTimeInput, '0');
    user.type(endTimeInput, '0');

    const headerText = await screen.findByText(
      'Mar 14 2022 00:00 - Mar 16 2022 23:00'
    );
    expect(headerText).toBeVisible();

    const saveButton = screen.getByRole('button', {
      name: 'Close schedule editor',
    });
    act(() => {
      saveButton.click();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Close schedule editor' })
      ).not.toBeInTheDocument();
    });

    expect(headerText).not.toBeInTheDocument();

    expect((input as HTMLInputElement).value).toBe(
      '14/03/22 00:00 - 16/03/22 23:00'
    );
    expect(onUpdateDateTimeRange).toHaveBeenCalledWith([
      new Date('2022-03-14T00:00:00.000Z'),
      new Date('2022-03-16T23:00:00.000Z'),
    ]);

    act(() => {
      input.click();
    });

    await waitFor(() => {
      expect(
        screen.getByText('Mar 14 2022 00:00 - Mar 16 2022 23:00')
      ).toBeVisible();
    });
  });

  it('should init with date', async () => {
    const user = userEvent.setup({ delay: null });
    const onUpdateDateTimeRange = jest.fn();
    render(
      <DateTimePickerModal
        dateTime={[
          new Date('2022-03-01T12:00:00.000Z'),
          new Date('2022-03-20T12:00:00.000Z'),
        ]}
        onUpdateDateTimeRange={onUpdateDateTimeRange}
      />
    );

    const input = screen.getByPlaceholderText('Select date range');
    act(() => {
      input.click();
    });

    await waitFor(() => {
      const endTimeInput = screen.getByLabelText('End time (GMT +1)');
      user.type(endTimeInput, '0');
      user.type(endTimeInput, '0');
    });

    const headerText = await screen.findByText(
      'Mar 01 2022 12:00 - Mar 20 2022 12:00'
    );
    expect(headerText).toBeVisible();

    const saveButton = screen.getByRole('button', {
      name: 'Close schedule editor',
    });
    act(() => {
      saveButton.click();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Close schedule editor' })
      ).not.toBeInTheDocument();
    });

    expect(headerText).not.toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe(
      '01/03/22 12:00 - 20/03/22 12:00'
    );
    expect(onUpdateDateTimeRange).toHaveBeenCalledWith([
      new Date('2022-03-01T12:00:00.000Z'),
      new Date('2022-03-20T12:00:00.000Z'),
    ]);
  });
});
