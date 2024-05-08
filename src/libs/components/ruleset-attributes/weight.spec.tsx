import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AttributeWeight } from './weight';

describe('AttributeWeight', () => {
  it('shows the attribute weight', () => {
    render(<AttributeWeight weight={1} />);

    expect(screen.getByText('Strength 100%')).toBeInTheDocument();
  });

  it('edits the attribute weight', async () => {
    const user = userEvent.setup();
    render(<AttributeWeight weight={1} isEditable />);

    const editButton = screen.getByLabelText('Edit weight');

    act(() => {
      editButton.click();
    });

    const input = screen.getByLabelText('Edit value');
    await user.type(input, '{Delete}{Delete}{Delete}20');

    const saveButton = screen.getByLabelText('Save weight change');

    act(() => {
      saveButton.click();
    });

    expect(screen.getByText('Strength 20%')).toBeInTheDocument();
  });

  it('clears the attribute weight', async () => {
    const user = userEvent.setup();
    render(<AttributeWeight weight={1} isEditable />);

    const editButton = screen.getByLabelText('Edit weight');

    act(() => {
      editButton.click();
    });

    const input = screen.getByRole('spinbutton', { name: 'Edit value' });
    await user.clear(input);

    expect(
      screen.getByText('Weight must be between 1 and 100')
    ).toBeInTheDocument();
  });

  it('saves the attribute weight change', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    render(
      <AttributeWeight weight={1} isEditable onChangeAttribute={mockOnChange} />
    );

    const editButton = screen.getByLabelText('Edit weight');

    act(() => {
      editButton.click();
    });

    const input = screen.getByRole('spinbutton', { name: 'Edit value' });
    await user.clear(input);
    await user.type(input, '99');

    fireEvent.submit(input);

    expect(mockOnChange).toHaveBeenCalledWith({ newWeight: 0.99 });
  });
});
