import { act, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { AttributeWeight } from './weight';

describe('AttributeWeight', () => {
  it('shows the attribute weight', () => {
    renderWithProviders(
      <AttributeWeight
        canEditWeight
        field="category"
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
        field="category"
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

  it('calls onDelete when delete button clicked', () => {
    const onDelete = jest.fn();

    renderWithProviders(
      <AttributeWeight
        canEditWeight
        field="category"
        onStartChanges={jest.fn()}
        onDelete={onDelete}
        weight={1}
        isEditable
      />
    );

    const deleteButton = screen.getByRole('button', {
      name: 'Delete attribute',
    });

    act(() => {
      deleteButton.click();
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
