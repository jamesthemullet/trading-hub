import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Toggle } from './toggle';

describe('Toggle', () => {
  it('should render correctly', () => {
    render(<Toggle checked onChange={jest.fn()} aria-label="Test toggle" />);

    expect(
      screen.getByRole('checkbox', { name: 'Test toggle' })
    ).toBeInTheDocument();
  });

  it('should call an onClick handler', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup({ delay: null });

    render(
      <Toggle
        checked={false}
        onChange={mockOnChange}
        aria-label="Test toggle"
      />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Test toggle' }));

    expect(mockOnChange).toHaveBeenCalled();
  });
});
