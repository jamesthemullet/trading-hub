import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetFacetAttributeValues } from '@/libs/hooks';
import { attributeValuesMock } from '@/pages/api/merchandising/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import { ModalEditValues } from './modal-edit-facets';

const mockUpdateGlobalFacet = jest.fn(() => Promise.resolve({}));
const updateGlobalFacet = {
  handleGlobalFacetUpdate: mockUpdateGlobalFacet,
  error: '',
};
const mockUpdateRuleSet = jest.fn();
const mockUseCheckMergeNameUnique = {
  error: '',
  checkMergeNameUnique: jest.fn(() => Promise.resolve({ isUniqueValue: true })),
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn().mockReturnValue(null),
  useGlobalFacetUpdate: () => {
    return updateGlobalFacet;
  },
}));

jest.mock('../../hooks/use-check-merge-name-unique', () => ({
  useCheckMergeNameUnique: () => mockUseCheckMergeNameUnique,
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
      isLoading: false,
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
        facetType="category"
        refreshData={() => jest.fn()}
        category="SubCategory_507"
      />
    );

    expect(screen.getByText('Facet value settings of: color')).toBeVisible();
  });

  it('should be able to edit a display value of a merged group', async () => {
    const onCloseSpy = jest.fn();
    renderWithProviders(
      <ModalEditValues
        onClose={onCloseSpy}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Merged 1'],
          merged: [
            {
              displayValue: 'Merged 1',
              mergedValues: ['Cotton', 'Duck Down'],
            },
          ],
        }}
        facetType="global"
        refreshData={() => jest.fn()}
        category={undefined}
      />
    );

    const editButton = screen.getByRole('button', {
      name: 'Edit display name for Merged 1',
    });

    act(() => {
      editButton.click();
    });

    await waitFor(async () => {
      expect(screen.getByLabelText('Edit Merged 1 input field')).toBeVisible();
    });

    const editColorInput = screen.getByLabelText('Edit Merged 1 input field');
    expect(editColorInput).toBeVisible();
    expect(editColorInput).toHaveValue('Merged 1');
    userEvent.clear(editColorInput);
    await userEvent.type(editColorInput, 'Merged 1 Candy');

    await waitFor(() => {
      expect(editColorInput).toHaveValue('Merged 1 Candy');
    });

    const saveButton = screen.getByRole('button', {
      name: 'Save Merged 1 change',
    });

    await userEvent.click(saveButton);

    await waitFor(() => {
      const newEditButton = screen.getByRole('button', {
        name: 'Edit display name for Merged 1 Candy',
      });
      expect(newEditButton).toBeVisible();
    });
  }, 10000);

  it('should not be able to edit a display value of a merged group to be an empty string', async () => {
    const onCloseSpy = jest.fn();
    renderWithProviders(
      <ModalEditValues
        onClose={onCloseSpy}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Merged 1'],
          merged: [
            {
              displayValue: 'Merged 1',
              mergedValues: ['Cotton', 'Duck Down'],
            },
          ],
        }}
        facetType="global"
        refreshData={() => jest.fn()}
        category={undefined}
      />
    );

    const editButton = screen.getByRole('button', {
      name: 'Edit display name for Merged 1',
    });

    act(() => {
      editButton.click();
    });

    await waitFor(async () => {
      const editColorInput = screen.getByLabelText('Edit Merged 1 input field');
      expect(editColorInput).toBeVisible();
      expect(editColorInput).toHaveValue('Merged 1');
      userEvent.clear(editColorInput);
      expect(editColorInput).toHaveValue('');
    });

    const saveButton = screen.getByRole('button', {
      name: 'Save Merged 1 change',
    });

    expect(saveButton).toBeDisabled();
  });

  it('should not be able to edit a display value, if not in a merge group', async () => {
    const onCloseSpy = jest.fn();
    renderWithProviders(
      <ModalEditValues
        onClose={onCloseSpy}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Cotton'],
        }}
        facetType="global"
        refreshData={() => jest.fn()}
        category={undefined}
      />
    );

    expect(screen.getAllByText('Cotton')[0]).toBeVisible();

    const editButton = screen.queryByRole('button', {
      name: 'Edit display name for Cotton',
    });

    expect(editButton).toBeNull();
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
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
        facetType="global"
        refreshData={() => jest.fn()}
        category={undefined}
      />
    );

    expect(screen.getAllByText('Cotton')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Duck Down')[0]).toBeInTheDocument();

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await userEvent.type(search, 'cotton');
    await waitFor<void>(() =>
      expect(useGetFacetAttributeValues).toHaveBeenCalledWith(
        '1',
        'cotton',
        undefined
      )
    );
  });

  it('should display loader components when retrieving attributes', async () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      pagination: {
        totalItems: 5,
      },
      refetch: jest.fn(),
      isLoading: true,
    });

    await act(async () => {
      renderWithProviders(
        <ModalEditValues
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk', 'More Silk'],
            excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
        />
      );
    });

    expect(screen.getAllByLabelText('attribute-value-skeleton')).toHaveLength(
      11
    );
  });

  it('should display error message when retrieving attributes fails', async () => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: [],
      error: 'Unknown error',
      pagination: {
        totalItems: 5,
      },
      refetch: jest.fn(),
      isLoading: false,
    });

    await act(async () => {
      renderWithProviders(
        <ModalEditValues
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk', 'More Silk'],
            excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
        />
      );
    });

    expect(
      screen.getByText('Error whilst retrieving values: Unknown error')
    ).toBeInTheDocument();
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
          boosted: ['Duck Down', 'Duck Down And Feather', 'Ducky Downy'],
          excludedValues: ['Ducky Downy And Feathery'],
        }}
        facetType="global"
        refreshData={() => jest.fn()}
        category={undefined}
      />
    );

    await user.click(screen.getByLabelText('Close attributes modal'));

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
            excludedValues: ['Cotton'],
          }}
          facetType="category"
          refreshData={() => jest.fn()}
          category="SubCategory_507"
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
          onClose={onCloseSpy}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
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
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
        />
      );
      const cottonCheckbox = screen.getByLabelText('Select Cotton to merge');
      const duckDownCheckbox = screen.getByLabelText(
        'Select Duck Down to merge'
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
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
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
      expect(screen.queryByText('Name your merge')).not.toBeInTheDocument();
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
          screen.getByLabelText('Edit Name your merge input field')
        ).toBeVisible();
      });
    }, 15000);

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
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
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

    it('should not save a merge if the name is the default merge name', async () => {
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
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
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
      await waitFor(async () => {
        const editColorInput = screen.getByLabelText(
          'Edit Name your merge input field'
        );
        expect(editColorInput).toBeVisible();
        expect(editColorInput).toHaveValue('Name your merge');
        await userEvent.keyboard('{enter}');
      });
      const saveButton = screen.getByLabelText('Save Name your merge change');
      expect(saveButton).toBeDisabled();
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
            boosted: ['Duck Down'],
            lastChanged: { user: 'Bob', date: '2021-10-01' },
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
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

      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );
      await waitFor(async () => {
        userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(mergeInputField).toHaveValue('New merge name');
      });

      act(() => {
        user.click(
          screen.getAllByLabelText('Remove merged facet for Duck Down')[0]
        );
      });
      await waitFor(() => {
        expect(
          screen.queryByText('Merged Value Group')
        ).not.toBeInTheDocument();
      });

      const firstDropdown = screen.getByTestId(
        'button to open facet order dropdown for Duck Down'
      );
      await waitFor(() => {
        expect(
          within(firstDropdown).getByText('Select an action')
        ).toBeVisible();
      });
    }, 10000);

    it('should de-merge both merged values when there are two attributes merged and remove from excluded', async () => {
      const user = userEvent.setup({ delay: null });
      const onCloseSpy = jest.fn();
      renderWithProviders(
        <ModalEditValues
          onClose={onCloseSpy}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            excludedValues: ['Duck Down', 'Silk'],
            lastChanged: { user: 'Bob', date: '2021-10-01' },
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
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
        expect(screen.getByText('Merged Value Group')).toBeVisible();
      });

      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );

      await waitFor(async () => {
        userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(
          screen.getAllByLabelText('Remove merged facet for Duck Down')[0]
        ).not.toBeDisabled();
      });

      act(() => {
        user.click(
          screen.getAllByLabelText('Remove merged facet for Duck Down')[0]
        );
      });
      await waitFor(() => {
        expect(
          screen.queryByText('Merged Value Group')
        ).not.toBeInTheDocument();
      });

      const firstDropdown = screen.getByTestId(
        'button to open facet order dropdown for Duck Down'
      );
      await waitFor(() => {
        expect(
          within(firstDropdown).getByText('Select an action')
        ).toBeVisible();
      });
    }, 10000);

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
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
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

      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );
      await waitFor(async () => {
        userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(mergeInputField).toHaveValue('New merge name');
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
    }, 10000);

    it('should not demerge a value if it is a category facet', async () => {
      const onCloseSpy = jest.fn();
      renderWithProviders(
        <ModalEditValues
          onClose={onCloseSpy}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['Merged 1', 'Merged 2'],
              },
            ],
          }}
          facetType="category"
          refreshData={() => jest.fn()}
          category="SubCategory_507"
        />
      );

      expect(screen.getByText('Merged Value Group')).toBeVisible();
      expect(screen.getByText('Merged 1')).toBeVisible();
      expect(
        screen.queryByRole('button', {
          name: 'Remove merged facet for Merged 1',
        })
      ).not.toBeInTheDocument();
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
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
        />
      );
      act(() => {
        user.click(screen.getByLabelText('Select Silk to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select More Silk to merge'));
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
          screen.getByLabelText('Edit Name your merge input field')
        ).toBeVisible();
      });

      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );
      await waitFor(async () => {
        userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(mergeInputField).toHaveValue('New merge name');
      });

      act(() => {
        user.click(screen.getByLabelText('Select Cotton to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select New merge name to merge'));
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
          screen.getByLabelText('Edit Name your merge input field')
        ).toBeVisible();
      });

      const mergeInputField2 = screen.getByLabelText(
        'Edit Name your merge input field'
      );

      await waitFor(async () => {
        userEvent.clear(mergeInputField2);
        await userEvent.type(mergeInputField2, 'Newer merge name');
        userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(mergeInputField2).toHaveValue('Newer merge name');
      });
    }, 15000);

    it('should select and deselect all facet attributes', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <ModalEditValues
          onClose={jest.fn()}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
          }}
          facetType="global"
          category={undefined}
        />
      );
      const selectAll = screen.getByLabelText('Select all facet attributes');

      act(() => {
        user.click(selectAll);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Merge (11)' })
        ).toBeVisible();
      });

      act(() => {
        user.click(selectAll);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
      });
    });

    it('should deselect all facet attributes toggle when unchecking a value', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <ModalEditValues
          onClose={jest.fn()}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
          }}
          facetType="global"
          category={undefined}
        />
      );
      const selectAll = screen.getByLabelText(
        'Select all facet attributes'
      ) as HTMLInputElement;

      act(() => {
        user.click(selectAll);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Merge (11)' })
        ).toBeVisible();
      });

      const cottonCheckbox = screen.getByLabelText('Select Cotton to merge');

      act(() => {
        user.click(cottonCheckbox);
      });

      await waitFor(() => {
        expect(selectAll.checked).toEqual(false);
      });
    });

    it('should show previously saved merge values', async () => {
      renderWithProviders(
        <ModalEditValues
          onClose={jest.fn()}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'foo',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
          }}
          facetType="global"
          category={undefined}
        />
      );

      expect(screen.getByText('Merged Value Group')).toBeVisible();
      expect(screen.getByLabelText('Label for foo')).toBeVisible();
    });

    it('should show error if user attempts to save a merge with a duplicate name', async () => {
      mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
        Promise.resolve({ isUniqueValue: false })
      );

      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <ModalEditValues
          onClose={jest.fn()}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'merged 1',
                mergedValues: ['merged 1', 'merged 2'],
              },
            ],
          }}
          facetType="global"
          category={undefined}
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
        expect(screen.getByText('Merged Value Group')).toBeVisible();
      });

      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );

      await waitFor(async () => {
        userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'Cotton');
        userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(
          screen.getAllByText(
            'The name above already exists. Please choose another one.'
          )[0]
        ).toBeVisible();
      });
    });
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
            boosted: [
              'Cotton',
              'Duck Down',
              'Duck Down And Feather',
              'Ducky Downy',
            ],
          }}
          facetType="category"
          refreshData={() => jest.fn()}
          category="SubCategory_507"
        />
      );
      await waitFor(() => {
        expect(screen.getByLabelText('attribute 0 Cotton')).toBeInTheDocument();
        expect(
          screen.getByLabelText('attribute 1 Duck Down')
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText('attribute 2 Duck Down And Feather')
        ).toBeInTheDocument();
      });
      user.click(screen.getByLabelText('Move Duck Down row up'));
      await waitFor(() =>
        expect(
          screen.getByLabelText('attribute 0 Duck Down')
        ).toBeInTheDocument()
      );
    }, 10000);

    it('should move down from second to third place', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <ModalEditValues
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: [
              'Cotton',
              'Duck Down',
              'Duck Down And Feather',
              'Ducky Downy',
            ],
          }}
          facetType="category"
          refreshData={() => jest.fn()}
          category="SubCategory_507"
        />
      );
      await waitFor(() =>
        expect(
          screen.getByLabelText('attribute 1 Duck Down')
        ).toBeInTheDocument()
      );
      user.click(screen.getByLabelText('Move Duck Down row down'));
      await waitFor(() =>
        expect(
          screen.getByLabelText('attribute 2 Duck Down')
        ).toBeInTheDocument()
      );
    });
  });

  describe('Saving', () => {
    it('should save initial and newly created merged values', async () => {
      mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
        Promise.resolve({ isUniqueValue: true })
      );
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <ModalEditValues
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk'],
            excludedValues: ['Merged 1', 'Merged 2'],
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['Merged 1', 'Merged 2'],
              },
            ],
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
        />
      );
      // create new
      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
      act(() => {
        user.click(screen.getByLabelText('Select Silk to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select Other Merged 1 to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select Other Merged 2 to merge'));
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
        user.click(screen.getByLabelText('Remove merged facet for Silk'));
      });
      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });
      // change name for initial

      await waitFor(async () => {
        const editMergedValue = screen.getByLabelText(
          'Edit Name your merge input field'
        );
        expect(editMergedValue).toBeVisible();
        expect(editMergedValue).toHaveValue('Name your merge');
        user.clear(editMergedValue);
        await user.type(editMergedValue, 'test test');
      });
      act(() => {
        screen.getByLabelText('Save Name your merge change').click();
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
            boosted: ['Silk', 'Other Merged 1', 'Other Merged 2'],
            displayValue: 'color',
            excludedValues: ['Merged 1', 'Merged 2'],
            id: '1',
            indexPropertyName: 'color',
            lastChanged: {
              date: '2021-10-01',
              user: 'Bob',
            },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['Merged 1', 'Merged 2'],
              },
              {
                displayValue: 'test test',
                mergedValues: ['Silk', 'Other Merged 1', 'Other Merged 2'],
              },
            ],
          },
          facetId: '1',
        })
      );
    }, 10000);

    it('should save initial and newly created merged values with included/excluded', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <ModalEditValues
          onClose={() => {}}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Merged 1', 'Merged 2'],
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['Merged 1', 'Merged 2'],
              },
            ],
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
        />
      );
      // create new
      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
      act(() => {
        user.click(screen.getByLabelText('Select Silk to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select Other Merged 1 to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select Other Merged 2 to merge'));
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
      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );
      await waitFor(async () => {
        userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        userEvent.keyboard('{enter}');
      });
      await waitFor(() => {
        expect(mergeInputField).toHaveValue('New merge name');
      });
      // neutral to excluded
      await user.click(
        screen.getByTestId('button to open facet order dropdown for Silk')
      );
      await user.click(screen.getByLabelText('exclude Silk'));
      const newGroupDropdown = screen.getByTestId(
        'button to open facet order dropdown for Silk'
      );
      await waitFor(() => {
        expect(
          within(newGroupDropdown).getByText('Exclude only')
        ).toBeVisible();
      });
      // change name for initial
      const testGroupDropdown = screen.getByTestId(
        'button to open facet order dropdown for Merged 1'
      );
      expect(within(testGroupDropdown).getByText('Include only')).toBeVisible();
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
      // save
      act(() => {
        screen.getByText('Save').click();
      });
      await waitFor(async () =>
        expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
          data: {
            boosted: ['Merged 1', 'Merged 2'],
            displayValue: 'color',
            excludedValues: ['Silk', 'Other Merged 1', 'Other Merged 2'],
            id: '1',
            indexPropertyName: 'color',
            lastChanged: {
              date: '2021-10-01',
              user: 'Bob',
            },
            merged: [
              {
                displayValue: 'test test',
                mergedValues: ['Merged 1', 'Merged 2'],
              },
              {
                displayValue: 'New merge name',
                mergedValues: ['Silk', 'Other Merged 1', 'Other Merged 2'],
              },
            ],
          },
          facetId: '1',
        })
      );
    }, 15000);

    it('should update included/excluded values for global facets', async () => {
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
                mergedValues: ['Merged 1', 'Merged 2'],
              },
            ],
          }}
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
        />
      );
      // neutral to excluded
      await user.click(
        screen.getByTestId('button to open facet order dropdown for Silk')
      );
      await user.click(screen.getByLabelText('exclude Silk'));
      // neutral to included
      await user.click(
        screen.getByTestId('button to open facet order dropdown for More Silk')
      );
      await user.click(screen.getByLabelText('include More Silk'));
      // included to excluded
      await user.click(
        screen.getByTestId('button to open facet order dropdown for Duck Down')
      );
      await user.click(screen.getByLabelText('exclude Duck Down'));
      // neutral to included
      await user.click(
        screen.getByTestId(
          'button to open facet order dropdown for Ducky Downy And Feathery'
        )
      );
      await user.click(
        screen.getByLabelText('include Ducky Downy And Feathery')
      );
      act(() => {
        screen.getByText('Save').click();
      });
      await waitFor(async () =>
        expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
          data: {
            boosted: ['More Silk', 'Ducky Downy And Feathery'],
            displayValue: 'color',
            excludedValues: ['Silk', 'Duck Down'],
            id: '1',
            indexPropertyName: 'color',
            lastChanged: {
              date: '2021-10-01',
              user: 'Bob',
            },
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['Merged 1', 'Merged 2'],
              },
            ],
          },
          facetId: '1',
        })
      );
    });

    it('should update included/excluded values for category facets, for both newly amended facets and existing unchanged facets', async () => {
      const user = userEvent.setup({ delay: null });
      const updatedValuesMock = jest
        .fn()
        .mockImplementation(() => mockUpdateRuleSet);
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
          facetType="category"
          refreshData={() => jest.fn()}
          updatedValues={updatedValuesMock}
          category="SubCategory_507"
        />
      );
      // neutral to excluded
      await user.click(
        screen.getByTestId('button to open facet order dropdown for Silk')
      );
      await user.click(screen.getByLabelText('exclude Silk'));
      // neutral to included
      await user.click(
        screen.getByTestId('button to open facet order dropdown for More Silk')
      );
      await user.click(screen.getByLabelText('include More Silk'));
      // included to excluded
      await user.click(
        screen.getByTestId('button to open facet order dropdown for Duck Down')
      );
      await user.click(screen.getByLabelText('exclude Duck Down'));
      // neutral to included
      await user.click(
        screen.getByTestId(
          'button to open facet order dropdown for Ducky Downy And Feathery'
        )
      );
      await user.click(
        screen.getByLabelText('include Ducky Downy And Feathery')
      );
      act(() => {
        screen.getByText('Done').click();
      });
      await waitFor(async () =>
        expect(updatedValuesMock).toHaveBeenCalledWith(
          ['More Silk', 'Ducky Downy And Feathery'],
          ['Silk', 'Duck Down'],
          '1'
        )
      );
    });

    it('should not refresh data if calling update global facet fails', async () => {
      const refreshDataMock = jest.fn();
      mockUpdateGlobalFacet.mockResolvedValueOnce({
        status: 'error',
      });
      updateGlobalFacet.error = 'Failed to update facet';
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
          facetType="global"
          refreshData={refreshDataMock}
          category={undefined}
        />
      );

      act(() => {
        user.click(screen.getByLabelText('Select Silk to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select More Silk to merge'));
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
      });

      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
        expect(
          screen.getByLabelText('Edit Name your merge input field')
        ).toBeVisible();
      });

      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );
      await waitFor(async () => {
        userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(mergeInputField).toHaveValue('New merge name');
      });

      act(() => {
        user.click(screen.getByText('Save'));
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error whilst updating facet: Failed to update facet'
          )
        ).toBeVisible();
        expect(refreshDataMock).not.toHaveBeenCalled();
      });
    });

    it('should not allow any other action during the process creating a merge group (ie when writing the name of the merge group)', async () => {
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
          facetType="global"
          refreshData={() => jest.fn()}
          category={undefined}
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
      });
      expect(
        screen.queryByLabelText('Remove merged facet for Duck Down')
      ).toBeDisabled();
      expect(screen.queryByLabelText('Select Cotton to merge')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeDisabled();
      expect(
        screen.getByRole('checkbox', { name: 'Select all facet attributes' })
      ).toBeDisabled();
      expect(
        screen.getByRole('checkbox', {
          name: 'Select test merged group to merge',
        })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Save changes to attributes' })
      ).toBeDisabled();
    });
  });

  it('should display error message when updating facet fails', async () => {
    updateGlobalFacet.error = 'Failed to update facet';
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
        facetType="global"
        refreshData={() => jest.fn()}
        category={undefined}
      />
    );

    expect(
      screen.getByText('Error whilst updating facet: Failed to update facet')
    ).toBeVisible();
  });
});
