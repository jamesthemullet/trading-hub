import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AttributeWeight } from './weight';

describe('AttributeWeight', () => {
  it('shows the attribute weight', () => {
    render(
      <AttributeWeight
        onChangeSubmit={jest.fn()}
        field="category"
        isEditing={false}
        setIsEditing={jest.fn()}
        weight={1}
      />
    );

    expect(screen.getByText('Strength 1%')).toBeInTheDocument();
  });

  it('Should render and call setIsEditing', async () => {
    const setIsEditing = jest.fn();

    render(
      <AttributeWeight
        onChangeSubmit={jest.fn()}
        field="category"
        isEditing={false}
        setIsEditing={setIsEditing}
        weight={1}
        isEditable
      />
    );

    const editButton = screen.getByLabelText('Edit attribute category');

    act(() => {
      editButton.click();
    });

    expect(setIsEditing).toHaveBeenCalledWith(true);
  });

  it('clears the attribute weight', async () => {
    const user = userEvent.setup();
    render(
      <AttributeWeight
        onChangeSubmit={jest.fn()}
        field="category"
        isEditing={true}
        setIsEditing={jest.fn()}
        weight={1}
        isEditable
      />
    );

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
      <AttributeWeight
        onChangeSubmit={mockOnChange}
        field="category"
        isEditing={true}
        setIsEditing={jest.fn()}
        weight={1}
        isEditable
      />
    );

    const input = screen.getByRole('spinbutton', { name: 'Edit value' });
    await user.clear(input);
    await user.type(input, '99');

    fireEvent.submit(input);

    expect(mockOnChange).toHaveBeenCalledWith({ weight: 99 });
  });
});
