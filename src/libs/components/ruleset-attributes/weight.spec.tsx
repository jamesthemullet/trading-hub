import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { AttributeWeight } from './weight';

describe('AttributeWeight', () => {
  it('shows the attribute weight', () => {
    renderWithProviders(
      <AttributeWeight
        canEditWeight
        onChangeSubmit={jest.fn()}
        field="category"
        isEditing={false}
        onStartChanges={jest.fn()}
        weight={1}
      />
    );

    expect(screen.getByText('Strength 1%')).toBeInTheDocument();
  });

  it('Should render and call onStartChanges', async () => {
    const onStartChanges = jest.fn();

    renderWithProviders(
      <AttributeWeight
        canEditWeight
        onChangeSubmit={jest.fn()}
        field="category"
        isEditing={false}
        onStartChanges={onStartChanges}
        weight={1}
        isEditable
      />
    );

    const editButton = screen.getByLabelText('Edit attribute category');

    act(() => {
      editButton.click();
    });

    expect(onStartChanges).toHaveBeenCalledTimes(1);
  });

  it('clears the attribute weight', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AttributeWeight
        canEditWeight
        onChangeSubmit={jest.fn()}
        field="category"
        isEditing
        onStartChanges={jest.fn()}
        weight={1}
        isEditable
      />
    );

    const input = screen.getByRole('spinbutton', {
      name: 'Strength %',
    });
    await user.clear(input);

    expect(
      screen.getByText('Weight must be between 1 and 100')
    ).toBeInTheDocument();
  });

  it('saves the attribute weight change', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    renderWithProviders(
      <AttributeWeight
        canEditWeight
        onChangeSubmit={mockOnChange}
        field="category"
        isEditing
        onStartChanges={jest.fn()}
        weight={1}
        isEditable
      />
    );

    const input = screen.getByRole('spinbutton', {
      name: 'Strength %',
    });

    fireEvent.change(input, { target: { value: '99' } });

    const saveButton = screen.getByRole('button', {
      name: 'Save attribute category change',
    });
    await user.click(saveButton);

    expect(mockOnChange).toHaveBeenCalledWith({ weight: 99 });
  });
});
