import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DragHandleButton } from './drag-handle-button';

describe('DragHandleButton', () => {
  const defaultProps = {
    disabled: false,
    displayName: 'test-attribute',
  };

  it('should render button correctly', () => {
    render(<DragHandleButton {...defaultProps} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('dragHandleButton');
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Reorder test-attribute'
    );
    expect(
      screen.getByTestId('drag-handle-test-attribute')
    ).toBeInTheDocument();
    const image = screen.getByAltText('Drag handle');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<DragHandleButton {...defaultProps} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should be enabled when disabled prop is false', () => {
    render(<DragHandleButton {...defaultProps} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-disabled', 'false');
  });

  it('should not call listeners when disabled', async () => {
    const mockListener = jest.fn();
    render(
      <DragHandleButton
        {...defaultProps}
        disabled
        listeners={{ onClick: mockListener }}
      />
    );

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button'));

    expect(mockListener).not.toHaveBeenCalled();
  });

  it('should call listeners when enabled and clicked', async () => {
    const mockListener = jest.fn();
    render(
      <DragHandleButton
        {...defaultProps}
        disabled={false}
        listeners={{ onPointerDown: mockListener }}
      />
    );

    const user = userEvent.setup({ delay: null });
    await user.pointer({
      keys: '[MouseLeft>]',
      target: screen.getByRole('button'),
    });

    expect(mockListener).toHaveBeenCalled();
  });

  it('should forward ref correctly', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<DragHandleButton {...defaultProps} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveAttribute('type', 'button');
  });

  it('should use setActivatorNodeRef when provided', () => {
    const mockSetActivatorNodeRef = jest.fn();
    render(
      <DragHandleButton
        {...defaultProps}
        setActivatorNodeRef={mockSetActivatorNodeRef}
      />
    );

    expect(mockSetActivatorNodeRef).toHaveBeenCalled();
  });

  it('should prefer setActivatorNodeRef over ref', () => {
    const mockSetActivatorNodeRef = jest.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <DragHandleButton
        {...defaultProps}
        ref={ref}
        setActivatorNodeRef={mockSetActivatorNodeRef}
      />
    );

    expect(mockSetActivatorNodeRef).toHaveBeenCalled();
    expect(ref.current).toBe(null);
  });

  it('should render with different displayName values', () => {
    const { rerender } = render(
      <DragHandleButton {...defaultProps} displayName="first-item" />
    );

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Reorder first-item'
    );
    expect(screen.getByTestId('drag-handle-first-item')).toBeInTheDocument();

    rerender(<DragHandleButton {...defaultProps} displayName="second-item" />);

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Reorder second-item'
    );
    expect(screen.getByTestId('drag-handle-second-item')).toBeInTheDocument();
  });
});
