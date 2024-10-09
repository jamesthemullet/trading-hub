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
      screen.queryByRole('button', { name: 'Save' })
    ).not.toBeInTheDocument();
    const input = screen.getByPlaceholderText('Select date range');
    act(() => {
      input.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    act(() => {
      cancelButton.click();
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Save' })
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
      expect(screen.getByText('Mar 14 2022')).toBeVisible();
    });

    await waitFor(() => {
      const endDate = screen.getAllByText('16')[0];
      act(() => {
        endDate.click();
      });
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    act(() => {
      saveButton.click();
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
    });
    expect((input as HTMLInputElement).value).toBe('Mar 14 - Mar 16');
  });

  it('should be able to select start time', async () => {
    const user = userEvent.setup({ delay: null });
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
      expect(screen.getByText('Mar 14 2022')).toBeVisible();
    });

    await waitFor(() => {
      const endDate = screen.getAllByText('16')[0];
      act(() => {
        endDate.click();
      });
    });

    const startTimeInput = screen.getByLabelText('Start time (GMT +1)');
    user.type(startTimeInput, '12:00');

    const headerText = await screen.findByText(
      'Mar 14 2022 12:00 - Mar 16 2022'
    );
    expect(headerText).toBeVisible();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    act(() => {
      saveButton.click();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
      expect(headerText).not.toBeInTheDocument();
    });
    expect((input as HTMLInputElement).value).toBe('Mar 14 - Mar 16');

    act(() => {
      input.click();
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Mar 14 2022 12:00 - Mar 16 2022')
      ).toBeVisible();
    });
  });

  it('should be able to select end time', async () => {
    const user = userEvent.setup({ delay: null });
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
      expect(screen.getByText('Mar 14 2022')).toBeVisible();
    });

    await waitFor(() => {
      const endDate = screen.getAllByText('16')[0];
      act(() => {
        endDate.click();
      });
    });

    const endTimeInput = screen.getByLabelText('End time (GMT +1)');
    user.type(endTimeInput, '12:00');

    const headerText = await screen.findByText(
      'Mar 14 2022 - Mar 16 2022 12:00'
    );
    expect(headerText).toBeVisible();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    act(() => {
      saveButton.click();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
      expect(headerText).not.toBeInTheDocument();
    });
    expect((input as HTMLInputElement).value).toBe('Mar 14 - Mar 16');

    act(() => {
      input.click();
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Mar 14 2022 - Mar 16 2022 12:00')
      ).toBeVisible();
    });
  });
});
