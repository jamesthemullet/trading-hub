import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { ModalEditValues } from './modal-edit-values';

const onCloseSpy = jest.fn();

describe('Add Facet Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render edit values modal', async () => {
    renderWithProviders(
      <ModalEditValues
        onClose={onCloseSpy}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
        }}
      />
    );

    expect(screen.getByText('Facet value settings of: color')).toBeVisible();
  });

  it('should edit a display value', async () => {
    renderWithProviders(
      <ModalEditValues
        onClose={onCloseSpy}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
        }}
      />
    );

    const editButton = screen.getByLabelText('Edit display name for Cotton');

    act(() => {
      editButton.click();
    });

    await waitFor(async () => {
      const editColorInput = screen.getByLabelText('Edit Cotton input field');
      expect(editColorInput).toBeVisible();
      expect(editColorInput).toHaveValue('Cotton');
      userEvent.clear(editColorInput);
      await userEvent.type(editColorInput, 'Cotton Candy');
    });

    const saveButton = screen.getByLabelText('Save Cotton change');

    act(() => {
      saveButton.click();
    });

    const newEditButton = screen.getByLabelText(
      'Edit display name for Cotton Candy'
    );
    expect(newEditButton).toBeVisible();
  });

  it('should search', async () => {
    renderWithProviders(
      <ModalEditValues
        onClose={() => {}}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
        }}
      />
    );

    expect(screen.getAllByText('Cotton')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Duck Down')[0]).toBeInTheDocument();

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await userEvent.type(search, 'cotton');

    expect(screen.getAllByText('Cotton')[0]).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Duck Down')).toBe(null));
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <ModalEditValues
        onClose={onCloseSpy}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCloseSpy).toHaveBeenCalled();
  });
});
