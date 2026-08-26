import { act, screen } from '@testing-library/react';

import { emitSaveSuccess } from '@/libs/utils/toast-events';
import { renderWithProviders } from '@/test/render-with-providers';

import { ToastProvider } from './toast-provider';

const renderToastProvider = () => renderWithProviders(<ToastProvider />);

afterEach(() => {
  jest.clearAllMocks();
});

describe('ToastProvider', () => {
  it('renders nothing until a save succeeds', () => {
    renderToastProvider();

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a toast when a save succeeds', () => {
    renderToastProvider();

    act(() => emitSaveSuccess('Changes have been saved successfully'));

    expect(
      screen.getByText('Changes have been saved successfully')
    ).toBeVisible();
  });

  it('stacks multiple toasts when several saves succeed in quick succession', () => {
    renderToastProvider();

    act(() => emitSaveSuccess('First message'));
    act(() => emitSaveSuccess('Second message'));

    expect(screen.getByText('First message')).toBeVisible();
    expect(screen.getByText('Second message')).toBeVisible();
  });

  it('dismisses only the toast that was closed, leaving others visible', () => {
    renderToastProvider();

    act(() => emitSaveSuccess('First message'));
    act(() => emitSaveSuccess('Second message'));

    act(() => {
      screen
        .getAllByRole('button', { name: 'Dismiss notification' })[0]
        .click();
    });

    expect(screen.queryByText('First message')).not.toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeVisible();
  });

  it('dismisses the toast when the close button is clicked', () => {
    renderToastProvider();

    act(() => emitSaveSuccess('Changes have been saved successfully'));

    act(() => {
      screen.getByRole('button', { name: 'Dismiss notification' }).click();
    });

    expect(
      screen.queryByText('Changes have been saved successfully')
    ).not.toBeInTheDocument();
  });

  it('stops listening for save events after unmounting', () => {
    const { unmount } = renderToastProvider();
    unmount();

    act(() => emitSaveSuccess('Changes have been saved successfully'));

    expect(
      screen.queryByText('Changes have been saved successfully')
    ).not.toBeInTheDocument();
  });

  it('positions the first toast at the bottom, and stacks subsequent ones above it', () => {
    renderToastProvider();

    act(() => emitSaveSuccess('First message'));
    const firstSlot = screen.getByText('First message').closest('[role]')
      ?.parentElement as HTMLElement;
    expect(firstSlot).toHaveStyle({ bottom: '0px' });

    act(() => emitSaveSuccess('Second message'));
    const secondSlot = screen.getByText('Second message').closest('[role]')
      ?.parentElement as HTMLElement;
    expect(secondSlot).not.toHaveStyle({ bottom: '0px' });
  });

  it('restarts stacking from the bottom once all toasts have cleared', () => {
    renderToastProvider();

    act(() => emitSaveSuccess('First message'));
    act(() => emitSaveSuccess('Second message'));

    act(() => {
      screen
        .getAllByRole('button', { name: 'Dismiss notification' })
        .forEach((button) => button.click());
    });

    act(() => emitSaveSuccess('Third message'));
    const thirdSlot = screen.getByText('Third message').closest('[role]')
      ?.parentElement as HTMLElement;
    expect(thirdSlot).toHaveStyle({ bottom: '0px' });
  });
});
