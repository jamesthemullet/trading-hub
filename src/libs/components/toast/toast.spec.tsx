import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { Toast } from './toast';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Toast', () => {
  it('renders the message', () => {
    renderWithProviders(
      <Toast
        message="Changes have been saved successfully"
        onDismiss={jest.fn()}
      />
    );

    expect(
      screen.getByText('Changes have been saved successfully')
    ).toBeVisible();
  });

  it('calls onDismiss when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    renderWithProviders(
      <Toast
        message="Changes have been saved successfully"
        onDismiss={onDismiss}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Dismiss notification' })
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after the given duration', () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    renderWithProviders(
      <Toast
        message="Changes have been saved successfully"
        onDismiss={onDismiss}
        autoDismissMs={3000}
      />
    );

    expect(onDismiss).not.toHaveBeenCalled();

    jest.advanceTimersByTime(3000);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('does not set up an auto-dismiss timer when autoDismissMs is not provided', () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    renderWithProviders(
      <Toast
        message="Changes have been saved successfully"
        onDismiss={onDismiss}
      />
    );

    jest.advanceTimersByTime(10000);

    expect(onDismiss).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('does not reset its countdown when a new onDismiss callback is passed in', () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    const { rerender } = renderWithProviders(
      <Toast
        message="Changes have been saved successfully"
        onDismiss={onDismiss}
        autoDismissMs={4000}
      />
    );

    jest.advanceTimersByTime(3000);

    // Simulate a parent re-render passing a brand-new onDismiss reference,
    // e.g. because a sibling toast was added or removed.
    const newOnDismiss = jest.fn();
    rerender(
      <Toast
        message="Changes have been saved successfully"
        onDismiss={newOnDismiss}
        autoDismissMs={4000}
      />
    );

    jest.advanceTimersByTime(1000);

    expect(newOnDismiss).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
