import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { CopyMessageBox } from './copy-message-box';

const writeText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText },
  configurable: true,
  writable: true,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CopyMessageBox', () => {
  const message =
    "I'm requesting for an Emergency Push for 'P60538523' as soon as possible.";

  it('renders the label and the message in a read-only input', () => {
    renderWithProviders(<CopyMessageBox message={message} />);
    expect(screen.getByText('Copy this message below:')).toBeVisible();
    expect(screen.getByDisplayValue(message)).toBeInTheDocument();
    expect(screen.getByLabelText('Copy message')).toHaveAttribute('readonly');
  });

  it('calls clipboard.writeText with the message when the copy button is clicked', () => {
    renderWithProviders(<CopyMessageBox message={message} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    expect(writeText).toHaveBeenCalledWith(message);
  });

  it('shows the copied state and reverts after 2 seconds', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({
      delay: null,
      advanceTimers: jest.advanceTimersByTime,
    });
    renderWithProviders(<CopyMessageBox message={message} />);

    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(2000));

    expect(
      screen.getByRole('button', { name: 'Copy to clipboard' })
    ).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('renders the message in a preformatted block when isMultiline is true', () => {
    renderWithProviders(<CopyMessageBox message={message} isMultiline />);

    const preformattedMessage = screen.getByText(message, { selector: 'pre' });
    expect(preformattedMessage).toBeInTheDocument();
  });
});
