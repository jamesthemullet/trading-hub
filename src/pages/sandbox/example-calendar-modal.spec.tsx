import { act, render, screen, waitFor } from '@testing-library/react';
import { ExampleCalendarModal } from './example-calendar-modal';

describe('ExampleCalendarModal', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2022, 2, 20));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should render correctly', async () => {
    render(<ExampleCalendarModal />);
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    const input = screen.getByPlaceholderText('Select date range');
    act(() => {
      input.click();
    });
    expect(await screen.findByText('Save')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    act(() => {
      cancelButton.click();
    });
    await waitFor(() => {
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('should call save', async () => {
    render(<ExampleCalendarModal />);
    const input = screen.getByPlaceholderText('Select date range');
    act(() => {
      input.click();
    });
    // select date range
    const startDate = await screen.findByText('14');

    act(() => {
      startDate.click();
    });
    await screen.findByText('Mar 14 - Mar 20');
    const endDate = await screen.findByText('16');
    act(() => {
      endDate.click();
    });

    const saveButton = await screen.findByText('Save');
    act(() => {
      saveButton.click();
    });
    await waitFor(() => {
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
    expect((input as HTMLInputElement).value).toBe('Mar 16 - ');
  });
});
