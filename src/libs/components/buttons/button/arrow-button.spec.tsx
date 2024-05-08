import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ArrowButton } from './arrow-button';

describe('ArrowButton', () => {
  it('should render button, without displaying text', () => {
    render(<ArrowButton>donotdisplay</ArrowButton>);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByText('donotdisplay')).not.toBeInTheDocument();
  });

  it('should render button with up arrow', () => {
    render(<ArrowButton direction="up"></ArrowButton>);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveStyle(
      'transform: rotate(180deg);'
    );
  });

  it('should call an onclick handler', async () => {
    const mockClickHandler = jest.fn();
    render(<ArrowButton onClick={mockClickHandler}></ArrowButton>);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button'));

    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('should not call an onclick handler when disabled', async () => {
    const mockClickHandler = jest.fn();
    render(
      <ArrowButton onClick={mockClickHandler} isDisabled={true}></ArrowButton>
    );

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button'));

    expect(mockClickHandler).not.toHaveBeenCalled();
  });
});
