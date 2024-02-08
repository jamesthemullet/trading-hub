import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Toggle } from './toggle';

describe('Toggle', () => {
  it('should render correctly', () => {
    render(<Toggle isEnabled onClick={jest.fn()} />);

    expect(screen.getByTitle('Toggle')).toBeInTheDocument();
  });

  it('should call an onClick handler', async () => {
    const mockClick = jest.fn();
    const user = userEvent.setup({ delay: null });

    render(<Toggle isEnabled={false} onClick={mockClick} />);

    await user.click(screen.getByTitle('Toggle'));

    expect(mockClick).toHaveBeenCalled();
  });
});
