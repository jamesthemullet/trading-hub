import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ReturnedGlobalFacet } from '@/libs/api';
import { useGetFacetAttributeValues, useGlobalFacetUpdate } from '@/libs/hooks';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';
import { attributeValuesMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import * as lodash from 'lodash';

import { EditFacetModalV2 } from './edit-facet-modal-v2';

jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  ...jest.requireActual('@/libs/hooks/use-get-facet-attribute-values'),
  useGetFacetAttributeValues: jest.fn(),
}));

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  intersection: jest.fn(),
  without: jest.fn(),
}));

const mockUseCheckMergeNameUnique = {
  error: '',
  checkMergeNameUnique: jest.fn(() => Promise.resolve({ isUniqueValue: true })),
};

jest.mock('@/libs/hooks/use-check-merge-name-unique', () => ({
  ...jest.requireActual('@/libs/hooks/use-check-merge-name-unique'),
  useCheckMergeNameUnique: jest.fn(),
}));

const facetMock = {
  displayValue: 'color',
  indexPropertyName: 'color',
  id: '1',
  lastChanged: { user: 'Bob', date: '2021-10-01' },
};

const onCloseSpy = jest.fn();
const onSaveSpy = jest.fn();

const mockDefaultGlobalFacetProps = {
  onClose: onCloseSpy,
  onSave: onSaveSpy,
  facet: facetMock,
  mergeEnabled: true,
  displayValueEditEnabled: true,
  removeFacetValueFromMergeGroupEnabled: true,
  category: 'global',
};

const mockDefaultCategoryFacetProps = {
  onClose: onCloseSpy,
  onSave: onSaveSpy,
  facet: facetMock,
  mergeEnabled: false,
  displayValueEditEnabled: true,
  removeFacetValueFromMergeGroupEnabled: false,
  category: 'SubCategory_507',
};

const mockUpdateGlobalFacet = jest.fn(() =>
  Promise.resolve({} as ReturnedGlobalFacet | { status: string })
);
const updateGlobalFacet = {
  handleGlobalFacetUpdate: mockUpdateGlobalFacet,
  error: '',
};

jest.mock('@/libs/hooks/global/facets/use-global-facet-update', () => ({
  ...jest.requireActual('@/libs/hooks/global/facets/use-global-facet-update'),
  useGlobalFacetUpdate: jest.fn(),
}));

describe('ModalEditValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (lodash.intersection as jest.Mock).mockReturnValue(['red']);
    (lodash.without as jest.Mock).mockReturnValue(['blue', 'green']);
    jest.mocked(useGlobalFacetUpdate).mockReturnValue(updateGlobalFacet);
    jest
      .mocked(useCheckMergeNameUnique)
      .mockReturnValue(mockUseCheckMergeNameUnique);
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
    renderWithProviders(
      <EditFacetModalV2 {...mockDefaultCategoryFacetProps} />
    );

    expect(
      await screen.findByText('Facet value settings of: color')
    ).toBeVisible();
  });

  it('should show error if user attempts to save a merge with a duplicate name', async () => {
    mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
      Promise.resolve({ isUniqueValue: false })
    );

    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultGlobalFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          excludedValues: ['Duck Down', 'Silk'],
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          merged: [
            {
              displayValue: 'Cotton',
              mergedValues: ['Cotton', 'Cotton Blend'],
            },
          ],
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
      expect(screen.getByText('Merged Value Group')).toBeVisible();
    });

    const mergeInputField = screen.getByLabelText(
      'Edit Name your merge input field'
    );

    await waitFor(async () => {
      await userEvent.clear(mergeInputField);
      await userEvent.type(mergeInputField, 'Cotton');
      await userEvent.keyboard('{enter}');
    });

    await waitFor(() => {
      expect(
        screen.getAllByText('Cotton is not a unique value')[0]
      ).toBeVisible();
    });
  });

  it('should close the modal', async () => {
    renderWithProviders(
      <EditFacetModalV2 {...mockDefaultCategoryFacetProps} />
    );

    const closeButton = await screen.findByLabelText('Close attributes modal');

    await userEvent.click(closeButton);

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('should save the modal', async () => {
    renderWithProviders(
      <EditFacetModalV2 {...mockDefaultCategoryFacetProps} />
    );

    const saveButton = await screen.findByText('Save');

    await userEvent.click(saveButton);

    expect(onSaveSpy).toHaveBeenCalledTimes(1);
  });

  it('should remove duplicated values', async () => {
    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultCategoryFacetProps}
        facet={{
          ...facetMock,
          boosted: ['red', 'Red', 'blue', 'green'],
          excludedValues: ['red', 'yellow'],
        }}
      />
    );

    expect(
      await screen.findByText('Facet value settings of: color')
    ).toBeVisible();

    expect(lodash.intersection).toHaveBeenCalledWith(
      ['red', 'Red', 'blue', 'green'],
      ['red', 'yellow']
    );
    expect(lodash.without).toHaveBeenCalledWith(
      ['red', 'Red', 'blue', 'green'],
      'red'
    );
  });

  it('should be able to edit a display value if not in a merge group', async () => {
    mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
      Promise.resolve({ isUniqueValue: true })
    );
    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultGlobalFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Cotton'],
        }}
      />
    );

    expect(screen.getAllByText('Cotton')[0]).toBeVisible();

    const editButton = screen.getByRole('button', {
      name: 'Edit display name for Cotton',
    });

    act(() => {
      editButton.click();
    });

    await waitFor(async () => {
      expect(screen.getByLabelText('Edit Cotton input field')).toBeVisible();
    });

    const editCottonInput = screen.getByLabelText('Edit Cotton input field');
    await userEvent.clear(editCottonInput);
    await userEvent.type(editCottonInput, 'Foo');

    const saveButton = screen.getByRole('button', {
      name: 'Save Cotton change',
    });

    await userEvent.click(saveButton);

    await waitFor(() => {
      const newEditButton = screen.getByRole('button', {
        name: 'Edit display name for Foo',
      });
      expect(newEditButton).toBeVisible();
    });
  });

  it('should be able to edit a display value back to the original name', async () => {
    mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
      Promise.resolve({ isUniqueValue: true })
    );
    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultGlobalFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          merged: [
            {
              displayValue: 'Cottonnn',
              mergedValues: ['Cotton'],
            },
          ],
        }}
      />
    );

    expect(screen.getAllByText('Cottonnn')[0]).toBeVisible();

    const editButton = screen.getByRole('button', {
      name: 'Edit display name for Cottonnn',
    });

    act(() => {
      editButton.click();
    });

    await waitFor(async () => {
      expect(screen.getByLabelText('Edit Cottonnn input field')).toBeVisible();
    });

    const editCottonInput = screen.getByLabelText('Edit Cottonnn input field');
    await userEvent.clear(editCottonInput);
    await userEvent.type(editCottonInput, 'Cotton');

    const saveButton = screen.getByRole('button', {
      name: 'Save Cottonnn change',
    });

    await userEvent.click(saveButton);

    await waitFor(() => {
      const newEditButton = screen.getByRole('button', {
        name: 'Edit display name for Cotton',
      });
      expect(newEditButton).toBeVisible();
    });
  });

  it('should not be able to edit a display value to the same name as another attribute value', async () => {
    mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
      Promise.resolve({ isUniqueValue: false })
    );

    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultGlobalFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Cotton'],
        }}
      />
    );

    expect(screen.getAllByText('Cotton')[0]).toBeVisible();

    const editButton = screen.getByRole('button', {
      name: 'Edit display name for Cotton',
    });

    act(() => {
      editButton.click();
    });

    await waitFor(async () => {
      expect(screen.getByLabelText('Edit Cotton input field')).toBeVisible();
    });

    const editCottonInput = screen.getByLabelText('Edit Cotton input field');
    await userEvent.clear(editCottonInput);
    await userEvent.type(editCottonInput, 'blue');

    const saveButton = screen.getByRole('button', {
      name: 'Save Cotton change',
    });

    await userEvent.click(saveButton);

    expect(await screen.findByText('blue is not a unique value')).toBeVisible();

    mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
      Promise.resolve({ isUniqueValue: true })
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

    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultGlobalFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
      />
    );

    expect(screen.getAllByTestId('attribute-value-skeleton')).toHaveLength(13);
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

    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultCategoryFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
        category={undefined}
      />
    );

    expect(
      screen.getByText('Error whilst retrieving values: Unknown error')
    ).toBeInTheDocument();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultCategoryFacetProps}
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Silk', 'More Silk'],
          excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
        }}
        category={undefined}
      />
    );

    await user.click(screen.getByLabelText('Close attributes modal'));

    expect(onCloseSpy).toHaveBeenCalled();
  });

  describe('Merge functionality', () => {
    it('should be able to edit a display value of a merged group', async () => {
      mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
        Promise.resolve({ isUniqueValue: true })
      );
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Merged 1'],
            merged: [
              {
                displayValue: 'Merged group 1',
                mergedValues: ['Cotton', 'Duck Down'],
              },
            ],
          }}
        />
      );

      const editButton = screen.getByRole('button', {
        name: 'Edit display name for Merged group 1',
      });

      act(() => {
        editButton.click();
      });

      await waitFor(async () => {
        expect(
          screen.getByLabelText('Edit Merged group 1 input field')
        ).toBeVisible();
      });

      const editColorInput = await screen.findByLabelText(
        'Edit Merged group 1 input field'
      );
      expect(editColorInput).toBeVisible();
      expect(editColorInput).toHaveValue('Merged group 1');
      await userEvent.clear(editColorInput);
      await userEvent.type(editColorInput, 'Merged 1 Candy');

      await waitFor(() => {
        expect(editColorInput).toHaveValue('Merged 1 Candy');
      });

      const saveButton = screen.getByRole('button', {
        name: 'Save Merged group 1 change',
      });

      await userEvent.click(saveButton);

      await waitFor(() => {
        const newEditButton = screen.getByRole('button', {
          name: 'Edit display name for Merged 1 Candy',
        });
        expect(newEditButton).toBeVisible();
      });
    });

    it('should not be able to edit a display value of a merged group to be an empty string', async () => {
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Merged 1'],
            merged: [
              {
                displayValue: 'Merged group 1',
                mergedValues: ['Cotton', 'Duck Down'],
              },
            ],
          }}
        />
      );

      const editButton = screen.getByRole('button', {
        name: 'Edit display name for Merged group 1',
      });

      act(() => {
        editButton.click();
      });

      const editColorInput = await screen.findByLabelText(
        'Edit Merged group 1 input field'
      );

      await waitFor(async () => {
        expect(editColorInput).toBeVisible();
      });

      expect(editColorInput).toHaveValue('Merged group 1');
      await userEvent.clear(editColorInput);
      expect(editColorInput).toHaveValue('');

      const saveButton = screen.getByRole('button', {
        name: 'Save Merged group 1 change',
      });

      expect(saveButton).toBeDisabled();
    });

    it('should preserve the selection when attribute is renamed', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk', 'More Silk'],
            excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
          }}
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

      const renameButton = await screen.findByLabelText(
        'Edit display name for Cotton'
      );
      await userEvent.click(renameButton);

      const inputField = await screen.findByLabelText(
        'Edit Cotton input field'
      );

      expect(inputField).toHaveValue('Cotton');

      await waitFor(async () => {
        await userEvent.clear(inputField);
        await userEvent.type(inputField, 'NewCotton');
        await userEvent.keyboard('{enter}');
      });

      const newCottonCheckbox = screen.getByLabelText(
        'Select NewCotton to merge'
      );

      expect(newCottonCheckbox).toBeChecked();
    });

    it('should merge two attributes', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk', 'More Silk'],
            excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
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
      expect(screen.queryByText('Name your merge')).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
      });
      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });
      act(() => {
        user.click(mergeButton);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });
      expect(
        screen.getByLabelText('Edit Name your merge input field')
      ).toBeVisible();
    }, 15000);

    it('should not save a merge if the name is the default merge name', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk', 'More Silk'],
            excludedValues: ['Cotton', 'Duck Down', 'Duck Down And Feather'],
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
      const editColorInput = await screen.findByLabelText(
        'Edit Name your merge input field'
      );
      await waitFor(async () => {
        expect(editColorInput).toBeVisible();
      });
      expect(editColorInput).toHaveValue('Name your merge');
      await userEvent.keyboard('{enter}');
      const saveButton = screen.getByLabelText('Save Name your merge change');
      expect(saveButton).toBeDisabled();
      expect(
        screen.getByText('Please name your merge to continue')
      ).toBeVisible();
    });

    it('should de-merge both merged values when there are two attributes merged and remove from excluded', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            excludedValues: ['Duck Down', 'Silk'],
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
        expect(screen.getByText('Merged Value Group')).toBeVisible();
      });

      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );

      await waitFor(async () => {
        await userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        await userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(
          screen.getAllByLabelText('Remove merged facet for Duck Down')[0]
        ).toBeEnabled();
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
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk', 'More Silk'],
            excludedValues: [],
            merged: [
              {
                displayValue: 'Cotton Merge Group',
                mergedValues: ['Cotton', 'Cotton Blend', 'Fake Cotton'],
              },
            ],
          }}
        />
      );

      act(() => {
        user.click(
          screen.getAllByLabelText('Remove merged facet for Cotton Blend')[0]
        );
      });
      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });
      expect(
        screen.queryByLabelText('Remove merged facet for Cotton Blend')
      ).not.toBeInTheDocument();
      expect(
        screen.getByLabelText('Remove merged facet for Cotton')
      ).toBeVisible();
    }, 10000);

    it('should not be able to de-merge a value if it is a category facet', async () => {
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultCategoryFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk', 'More Silk'],
            excludedValues: [],
            merged: [
              {
                displayValue: 'Cotton Merge Group',
                mergedValues: ['Cotton', 'Cotton Blend', 'Fake Cotton'],
              },
            ],
          }}
        />
      );

      expect(screen.getByText('Cotton Merge Group')).toBeVisible();
      expect(screen.getByText('Cotton Blend')).toBeVisible();
      expect(
        screen.queryByRole('button', {
          name: 'Remove merged facet for Cotton Blend',
        })
      ).not.toBeInTheDocument();
    });

    it('should merge into an existing merged value group', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: ['Silk', 'More Silk'],
            excludedValues: [],
            merged: [
              {
                displayValue: 'Cotton Merge Group',
                mergedValues: ['Cotton', 'Cotton Blend', 'Fake Cotton'],
              },
            ],
          }}
        />
      );

      act(() => {
        user.click(screen.getByLabelText('Select Silk to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select Cotton Merge Group to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
      });
      const updatedMergeButton = screen.getByRole('button', {
        name: 'Merge (2)',
      });
      act(() => {
        user.click(updatedMergeButton);
      });
      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });
      expect(
        screen.getByLabelText('Edit Name your merge input field')
      ).toBeVisible();

      const mergeInputField2 = screen.getByLabelText(
        'Edit Name your merge input field'
      );

      await waitFor(async () => {
        await userEvent.clear(mergeInputField2);
        await userEvent.type(mergeInputField2, 'Newer merge name');
        await userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(mergeInputField2).toHaveValue('Newer merge name');
      });
    }, 15000);

    it('should show previously saved merge values', async () => {
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            merged: [
              {
                displayValue: 'foo',
                mergedValues: ['Merged 1', 'Merged 2'],
              },
            ],
          }}
        />
      );

      expect(screen.getByText('Merged Value Group')).toBeVisible();
      expect(screen.getByTestId('Label for foo')).toBeVisible();
    });
  });

  describe('Saving', () => {
    it('should save initial and newly created merged values', async () => {
      mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
        Promise.resolve({ isUniqueValue: true })
      );
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
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
      const mergeButton = screen.getByRole('button', { name: 'Merge (3)' });
      act(() => {
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
      const editMergedValue = await screen.findByLabelText(
        'Edit Name your merge input field'
      );

      await waitFor(async () => {
        expect(editMergedValue).toBeVisible();
      });

      expect(editMergedValue).toHaveValue('Name your merge');
      user.clear(editMergedValue);
      await user.type(editMergedValue, 'test test');
      act(() => {
        screen.getByLabelText('Save Name your merge change').click();
      });
      await waitFor(() => {
        expect(
          screen.getByLabelText('Edit display name for test test')
        ).toBeVisible();
      });

      act(() => {
        screen
          .getByRole('button', { name: 'Save changes to attributes' })
          .click();
      });

      await waitFor(async () =>
        expect(onSaveSpy).toHaveBeenCalledWith({
          boosted: ['blue', 'green'],
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
        })
      );
    }, 10000);

    it('should update included/excluded values for global facets', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
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
        screen
          .getByRole('button', { name: 'Save changes to attributes' })
          .click();
      });
      await waitFor(async () =>
        expect(onSaveSpy).toHaveBeenCalledWith({
          boosted: ['blue', 'green', 'More Silk', 'Ducky Downy And Feathery'],
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
        })
      );
    });

    it('should update included/excluded values for category facets, for both newly amended facets and existing unchanged facets', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultCategoryFacetProps}
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
        screen
          .getByRole('button', { name: 'Save changes to attributes' })
          .click();
      });
      await waitFor(async () =>
        expect(onSaveSpy).toHaveBeenCalledWith({
          boosted: ['blue', 'green', 'More Silk', 'Ducky Downy And Feathery'],
          displayValue: 'color',
          id: '1',
          indexPropertyName: 'color',
          lastChanged: { date: '2021-10-01', user: 'Bob' },
          excludedValues: ['Silk', 'Duck Down'],
          merged: [
            {
              displayValue: 'test merged group',
              mergedValues: ['merged 1', 'merged 2'],
            },
          ],
        })
      );
    });

    it('should not allow any other action during the process creating a merge group (ie when writing the name of the merge group)', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
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
      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });
      act(() => {
        user.click(mergeButton);
      });
      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });
      expect(
        screen.getByLabelText('Remove merged facet for Duck Down')
      ).toBeDisabled();
      expect(screen.getByLabelText('Select Cotton to merge')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeDisabled();
      expect(
        screen.getByRole('checkbox', { name: 'Select all facet attributes' })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Save changes to attributes' })
      ).toBeDisabled();
    });

    it('should not refresh data if calling update global facet fails', async () => {
      const refreshDataMock = jest.fn();
      mockUpdateGlobalFacet.mockResolvedValueOnce({
        status: 'error',
      });
      updateGlobalFacet.error = 'Failed to update facet';
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalV2
          {...mockDefaultGlobalFacetProps}
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
      const mergeButton = screen.getByRole('button', { name: 'Merge (2)' });
      act(() => {
        user.click(mergeButton);
      });
      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });

      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });

      expect(
        screen.getByLabelText('Edit Name your merge input field')
      ).toBeVisible();

      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );
      await waitFor(async () => {
        await userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        await userEvent.keyboard('{enter}');
      });

      await waitFor(() => {
        expect(mergeInputField).toHaveValue('New merge name');
      });

      act(() => {
        user.click(
          screen.getByRole('button', { name: 'Save changes to attributes' })
        );
      });

      expect(refreshDataMock).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error whilst updating facet: Failed to update facet'
          )
        ).toBeVisible();
      });
      expect(refreshDataMock).not.toHaveBeenCalled();
    });

    it('should save initial and newly created merged values with undefined included/excluded', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalV2
          onClose={onCloseSpy}
          onSave={onSaveSpy}
          category="global"
          facet={{
            displayValue: 'color',
            indexPropertyName: 'color',
            id: '1',
            lastChanged: { user: 'Bob', date: '2021-10-01' },
            boosted: undefined,
            excludedValues: undefined,
            merged: [
              {
                displayValue: 'test merged group',
                mergedValues: ['Merged 1', 'Merged 2'],
              },
            ],
          }}
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
      const mergeButton = screen.getByRole('button', { name: 'Merge (3)' });
      act(() => {
        user.click(mergeButton);
      });
      await waitFor(() => {
        expect(screen.getAllByText('Merged Value Group')[0]).toBeVisible();
      });
      const mergeInputField = screen.getByLabelText(
        'Edit Name your merge input field'
      );
      await waitFor(async () => {
        await userEvent.clear(mergeInputField);
        await userEvent.type(mergeInputField, 'New merge name');
        await userEvent.keyboard('{enter}');
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
      expect(
        within(testGroupDropdown).getByText('Select an action')
      ).toBeVisible();
      act(() => {
        screen
          .getByLabelText('Edit display name for test merged group')
          .click();
      });
      const editMergedValue = await screen.findByLabelText(
        'Edit test merged group input field'
      );
      await waitFor(async () => {
        expect(editMergedValue).toBeVisible();
      });

      expect(editMergedValue).toHaveValue('test merged group');
      user.clear(editMergedValue);
      await user.type(editMergedValue, 'test test');
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
        screen
          .getByRole('button', { name: 'Save changes to attributes' })
          .click();
      });
      await waitFor(async () =>
        expect(onSaveSpy).toHaveBeenCalledWith({
          boosted: ['blue', 'green'],
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
        })
      );
    }, 15000);
  });

  it('should display error message when updating facet fails', async () => {
    updateGlobalFacet.error = 'Failed to update facet';
    renderWithProviders(
      <EditFacetModalV2
        {...mockDefaultGlobalFacetProps}
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

    expect(
      screen.getByText('Error whilst updating facet: Failed to update facet')
    ).toBeVisible();
  });
});
