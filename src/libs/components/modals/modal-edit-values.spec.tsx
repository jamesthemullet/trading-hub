import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { ModalEditValues } from './modal-edit-values';

describe('Add Facet Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render edit values modal', async () => {
    const onCloseSpy = jest.fn();
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
    const onCloseSpy = jest.fn();
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
  }, 15000);

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
    const onCloseSpy = jest.fn();

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

  describe('Merge functionality', () => {
    it('should disable the merge button if less than two attributes selected', () => {
      const onCloseSpy = jest.fn();
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

      const mergeButton = screen.getByRole('button', { name: 'Merge (0)' });

      expect(mergeButton).toBeDisabled();
    });

    it('should enable the merge button if two attributes selected', async () => {
      const onCloseSpy = jest.fn();
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

      const cottonCheckbox = screen.getByLabelText('Select Duck Down to merge');
      const duckDownCheckbox = screen.getByLabelText(
        'Select Ducky Downy to merge'
      );

      act(() => {
        user.click(cottonCheckbox);
      });

      await waitFor(() => {
        const mergeButton = screen.getByRole('button', { name: 'Merge (1)' });
        expect(mergeButton).toBeDisabled();
      });

      act(() => {
        user.click(duckDownCheckbox);
      });

      await waitFor(() => {
        const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });
        expect(mergeButton).toBeEnabled();
      });
    }, 10000);

    it('should merge two attributes', async () => {
      const user = userEvent.setup({ delay: null });
      const onCloseSpy = jest.fn();

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

      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();

      act(() => {
        user.click(screen.getByLabelText('Select Duck Down to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select Ducky Downy to merge'));
      });

      expect(screen.queryByText('Merged Value Group')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Name your merged value group')
      ).not.toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
      });

      act(() => {
        const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });
        user.click(mergeButton);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
        expect(
          screen.getAllByText('Name your merged value group')[0]
        ).toBeVisible();
        expect(
          screen.queryByRole('button', { name: 'Merge (2)' })
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Merge (0)' })
        ).toBeDisabled();
      });
    }, 15000);
  });

  it('should unselect a merged value', async () => {
    const user = userEvent.setup({ delay: null });
    const onCloseSpy = jest.fn();

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

    act(() => {
      user.click(screen.getByLabelText('Select Cotton to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
    });

    act(() => {
      user.click(screen.getByLabelText('Select Cotton to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
    });
  });

  it('should de-merge both merged values when there are two attributes merged', async () => {
    const user = userEvent.setup({ delay: null });
    const onCloseSpy = jest.fn();

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

    act(() => {
      user.click(screen.getByLabelText('Select Duck Down to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
    });

    act(() => {
      user.click(screen.getByLabelText('Select Ducky Downy to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
    });

    act(() => {
      user.click(screen.getByRole('button', { name: 'Merge (2)' }));
    });

    await waitFor(() => {
      expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
    });

    act(() => {
      user.click(
        screen.getAllByLabelText('Remove merged facet for Duck Down')[0]
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Merged Value Group')).not.toBeInTheDocument();
    });
  });

  it('should de-merge only the selected value when there are three attributes merged', async () => {
    const user = userEvent.setup({ delay: null });
    const onCloseSpy = jest.fn();

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

    act(() => {
      user.click(screen.getByLabelText('Select Duck Down to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
    });

    act(() => {
      user.click(screen.getByLabelText('Select Ducky Downy to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
    });

    act(() => {
      user.click(screen.getByLabelText('Select Cotton to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (3)' })).toBeVisible();
    });

    act(() => {
      user.click(screen.getByRole('button', { name: 'Merge (3)' }));
    });

    await waitFor(() => {
      expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
    });

    act(() => {
      user.click(
        screen.getAllByLabelText('Remove merged facet for Ducky Downy')[0]
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      expect(
        screen.queryByLabelText('Remove merged facet for Ducky Downy')
      ).not.toBeInTheDocument();
    });
  });

  it('should merge into an existing merged value group', async () => {
    const user = userEvent.setup({ delay: null });
    const onCloseSpy = jest.fn();

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

    act(() => {
      user.click(screen.getByLabelText('Select Duck Down to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
    });

    act(() => {
      user.click(screen.getByLabelText('Select Ducky Downy to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
    });

    act(() => {
      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });
      user.click(mergeButton);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      expect(
        screen.getAllByText('Name your merged value group')[0]
      ).toBeVisible();
    });

    act(() => {
      user.click(screen.getByLabelText('Select Cotton to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
    });

    act(() => {
      user.click(screen.getByLabelText('Select Ducky Downy to merge'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Merge (3)' })).toBeVisible();
    });

    act(() => {
      const mergeButton = screen.getByRole('button', { name: 'Merge (3)' });
      user.click(mergeButton);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      expect(
        screen.getAllByText('Name your merged value group')[0]
      ).toBeVisible();
    });
  });
});
