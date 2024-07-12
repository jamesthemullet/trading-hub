import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetFacetAttributeValues } from '@/libs/hooks';
import { attributeValuesMock } from '@/pages/api/merchandising/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import { ModalEditValues } from './modal-edit-values';

const mockUpdateGlobalFacet = jest.fn();

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  useGlobalFacetUpdate: () => {
    return { handleUpdate: mockUpdateGlobalFacet };
  },
}));

describe('ModalEditValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      pagination: {
        totalItems: 5,
      },
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
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

    act(() => {
      screen.getByText('Save').click();
    });
    await waitFor(async () => expect(onCloseSpy).toHaveBeenCalled());
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
    it('should not show merge options if not enabled', async () => {
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

      const mergeButton = screen.queryByRole('button', { name: 'Merge (0)' });
      const mergeCheckBoxes = screen.queryAllByRole('checkbox');

      expect(mergeButton).toBeNull();
      expect(mergeCheckBoxes.length).toBe(0);
    });

    it('should disable the merge button if less than two attributes selected', () => {
      const onCloseSpy = jest.fn();
      renderWithProviders(
        <ModalEditValues
          canMerge
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
          canMerge
          onClose={onCloseSpy}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
          }}
        />
      );

      const cottonCheckbox = screen.getByLabelText('Select duck down to merge');
      const duckDownCheckbox = screen.getByLabelText(
        'Select ducky downy to merge'
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
          canMerge
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
        user.click(screen.getByLabelText('Select duck down to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select ducky downy to merge'));
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

    it('should unselect a merged value', async () => {
      const user = userEvent.setup({ delay: null });
      const onCloseSpy = jest.fn();

      renderWithProviders(
        <ModalEditValues
          canMerge
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
        user.click(screen.getByLabelText('Select cotton to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select cotton to merge'));
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
          canMerge
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
        user.click(screen.getByLabelText('Select duck down to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select ducky downy to merge'));
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
          screen.getAllByLabelText('Remove merged facet for duck down')[0]
        );
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Merged Value Group')
        ).not.toBeInTheDocument();
      });
    }, 10000);

    it('should de-merge only the selected value when there are three attributes merged', async () => {
      const user = userEvent.setup({ delay: null });
      const onCloseSpy = jest.fn();

      renderWithProviders(
        <ModalEditValues
          canMerge
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
        user.click(screen.getByLabelText('Select duck down to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select ducky downy to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select cotton to merge'));
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
          screen.getAllByLabelText('Remove merged facet for ducky downy')[0]
        );
      });

      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
        expect(
          screen.queryByLabelText('Remove merged facet for ducky downy')
        ).not.toBeInTheDocument();
      });
    }, 10000);

    it('should merge into an existing merged value group', async () => {
      const user = userEvent.setup({ delay: null });
      const onCloseSpy = jest.fn();

      renderWithProviders(
        <ModalEditValues
          canMerge
          onClose={onCloseSpy}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
          }}
        />
      );

      act(() => {
        user.click(screen.getByLabelText('Select silk to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select more silk to merge'));
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
        user.click(screen.getByLabelText('Select cotton to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select silk to merge'));
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

      act(() => {
        user.click(screen.getByLabelText('Select silk to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (3)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select silk to merge'));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
      });
    }, 15000);
  });

  describe('Reorder', () => {
    it('should move up from second to first place', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <ModalEditValues
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByLabelText('attribute 3 merged 1')
        ).toBeInTheDocument();
        expect(screen.getByLabelText('attribute 4 cotton')).toBeInTheDocument();
        expect(
          screen.getByLabelText('attribute 1 duck down and feather')
        ).toBeInTheDocument();
      });

      user.click(screen.getByLabelText('Move duck down and feather row up'));

      await waitFor(() =>
        expect(
          screen.getByLabelText('attribute 0 duck down and feather')
        ).toBeInTheDocument()
      );
    }, 10000);

    it('should move down from second to third place', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <ModalEditValues
          canMerge
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
          }}
        />
      );

      await waitFor(() =>
        expect(
          screen.getByLabelText('attribute 1 duck down and feather')
        ).toBeInTheDocument()
      );

      user.click(screen.getByLabelText('Move duck down and feather row down'));

      await waitFor(() =>
        expect(
          screen.getByLabelText('attribute 2 duck down and feather')
        ).toBeInTheDocument()
      );
    });
  });

  describe('Saving', () => {
    it('should save initial and newly created merged values', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <ModalEditValues
          canMerge
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
          }}
        />
      );

      // create new
      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();

      act(() => {
        user.click(screen.getByLabelText('Select other merged 1 to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select other merged 2 to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
      });

      act(() => {
        user.click(screen.getByLabelText('Select silk to merge'));
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
      });

      act(() => {
        user.click(screen.getByLabelText('Remove merged facet for silk'));
      });
      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });

      // change name for initial
      act(() => {
        screen
          .getByLabelText('Edit display name for test merged group')
          .click();
      });

      await waitFor(async () => {
        const editMergedValue = screen.getByLabelText(
          'Edit test merged group input field'
        );
        expect(editMergedValue).toBeVisible();
        expect(editMergedValue).toHaveValue('test merged group');
        user.clear(editMergedValue);
        await user.type(editMergedValue, 'test test');
      });

      act(() => {
        screen.getByLabelText('Save test merged group change').click();
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Edit display name for test test')
        ).toBeVisible();
      });

      act(() => {
        screen.getByText('Save').click();
      });
      await waitFor(async () =>
        expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
          data: {
            boosted: ['duck down', 'duck down and feather', 'ducky downy'],
            displayValue: 'color',
            excludedValues: ['Ducky Downy And Feathery'],
            id: '1',
            indexPropertyName: 'color',
            lastChanged: {
              date: '2021-10-01',
              user: 'Bob',
            },
            merged: [
              {
                displayValue: 'test test',
                mergedValues: ['merged 1', 'merged 2'],
              },
              {
                displayValue: 'Name your merged value group',
                mergedValues: ['other merged 1', 'other merged 2'],
              },
            ],
          },
          facetId: '1',
        })
      );
    }, 10000);

    it('should update included/excluded values', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <ModalEditValues
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
          }}
        />
      );

      // neutral to excluded
      await user.click(
        screen.getByTestId('button to open facet order dropdown for silk')
      );
      await user.click(screen.getByLabelText('exclude silk'));
      // neutral to included
      await user.click(
        screen.getByTestId('button to open facet order dropdown for more silk')
      );
      await user.click(screen.getByLabelText('include more silk'));
      // included to excluded
      await user.click(
        screen.getByTestId('button to open facet order dropdown for duck down')
      );
      await user.click(screen.getByLabelText('exclude duck down'));
      // neutral to included
      await user.click(
        screen.getByTestId(
          'button to open facet order dropdown for ducky downy and feathery'
        )
      );
      await user.click(
        screen.getByLabelText('include ducky downy and feathery')
      );

      act(() => {
        screen.getByText('Save').click();
      });
      await waitFor(async () =>
        expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
          data: {
            boosted: [
              'duck down and feather',
              'ducky downy',
              'more silk',
              'ducky downy and feathery',
            ],
            displayValue: 'color',
            excludedValues: ['Duck Down', 'Silk'],
            id: '1',
            indexPropertyName: 'color',
            lastChanged: {
              date: '2021-10-01',
              user: 'Bob',
            },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
          },
          facetId: '1',
        })
      );
    });
  });
});
