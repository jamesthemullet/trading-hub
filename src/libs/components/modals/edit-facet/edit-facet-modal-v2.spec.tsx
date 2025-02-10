import { useReducer } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGlobalFacetUpdate } from '@/libs/hooks/global/facets/use-global-facet-update';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';
import { renderWithProviders } from '@/test/render-with-providers';

import { EditFacetModalV2 } from './edit-facet-modal-v2';
import { useAttributeValuesRowsSelector } from './use-attribute-values-rows-selector';

jest.mock('./use-attribute-values-rows-selector', () => ({
  ...jest.requireActual('./use-attribute-values-rows-selector'),
  useAttributeValuesRowsSelector: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-global-facet-update', () => ({
  ...jest.requireActual('@/libs/hooks/global/facets/use-global-facet-update'),
  useGlobalFacetUpdate: jest.fn(),
}));

jest.mock('@/libs/hooks/use-check-merge-name-unique', () => ({
  ...jest.requireActual('@/libs/hooks/use-check-merge-name-unique'),
  useCheckMergeNameUnique: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useReducer: jest.fn(),
}));

const dispatchMock = jest.fn();

const facetMock = {
  displayValue: 'color',
  indexPropertyName: 'color',
  id: '1',
  lastChanged: { user: 'Bob', date: '2021-10-01' },
};

const useAttributeValuesRowsSelectorReturnMock: ReturnType<
  typeof useAttributeValuesRowsSelector
> = {
  isLoading: false,
  attributeValuesState: [
    {
      id: 'red',
      displayType: 'default',
      displayValue: 'red',
      mergeType: 'unmerged',
      meta: {
        isBeginningOfDisplayTypeGroup: true,
        isEndOfDisplayTypeGroup: true,
      },
    },
  ],
  error: '',
};

describe('ModalEditValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: () =>
        Promise.resolve({
          isUniqueValue: true,
        }),
      error: '',
    });
    jest.mocked(useReducer).mockReturnValue([facetMock, dispatchMock]);
    jest
      .mocked(useAttributeValuesRowsSelector)
      .mockReturnValue(useAttributeValuesRowsSelectorReturnMock);
    jest.mocked(useGlobalFacetUpdate).mockReturnValue({
      handleGlobalFacetUpdate: jest.fn(),
      error: '',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render edit values modal', async () => {
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    expect(
      await screen.findByText('Facet value settings of: color')
    ).toBeVisible();

    expect(await screen.findByText('1 result')).toBeVisible();
  });

  it('should render loading state', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      isLoading: true,
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    expect(
      await screen.findByText('Facet value settings of: color')
    ).toBeVisible();

    expect(await screen.findByText('1 result')).toBeVisible();

    expect(useAttributeValuesRowsSelector).toHaveBeenCalledTimes(1);
    expect(useAttributeValuesRowsSelector).toHaveBeenCalledWith(
      facetMock,
      '',
      'SubCategory_507'
    );

    expect(
      await screen.findByLabelText('attribute-value-skeleton')
    ).toBeVisible();
  });

  it('should render merge group', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'reds',
          displayType: 'default',
          displayValue: 'reds',
          mergeType: 'merged',
          mergedValues: ['red', 'scarlet'],
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        category="SubCategory_507"
      />
    );

    expect(
      await screen.findByLabelText('Merged value red label')
    ).toBeVisible();

    expect(
      await screen.findByLabelText('Remove merged facet for red')
    ).toBeVisible();

    expect(
      await screen.findByLabelText('Merged value scarlet label')
    ).toBeVisible();
  });

  it('should not allow de-merge of a merged value that is the same as the display value', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'merged',
          mergedValues: ['red', 'scarlet'],
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        category="SubCategory_507"
      />
    );

    expect(
      screen.queryByLabelText('Remove merged facet for red')
    ).not.toBeInTheDocument();

    expect(
      screen.getByLabelText('Remove merged facet for scarlet')
    ).toBeInTheDocument();
  });

  it('should render merge group without remove button', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'merged',
          mergedValues: ['red', 'blue'],
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        removeFacetValueFromMergeGroupEnabled={false}
        category="SubCategory_507"
      />
    );

    expect(
      await screen.findByLabelText('Merged value red label')
    ).toBeVisible();

    expect(
      screen.queryByLabelText('Remove merged value red from color merge group')
    ).not.toBeInTheDocument();
  });

  it('should not render merge group and not allow removal', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'merged',
          mergedValues: ['red', 'blue'],
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={false}
        removeFacetValueFromMergeGroupEnabled={false}
        category="SubCategory_507"
      />
    );

    expect(screen.getByLabelText('Merged value red label')).toBeVisible();

    expect(
      screen.queryByLabelText('Remove merged value red from red merge group')
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText('Merge selected facet attributes button')
    ).not.toBeInTheDocument();
  });

  it('should dispatch MOVE_BOOSTED_ROW_DOWN', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'boosted',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: false,
          },
        },
        {
          id: 'blue',
          displayType: 'boosted',
          displayValue: 'blue',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: false,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    await userEvent.click(screen.getByLabelText('Move red row down'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'MOVE_BOOSTED_ROW_DOWN',
      payload: {
        id: 'red',
      },
    });
  });

  it('should dispatch MOVE_BOOSTED_ROW_UP', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'boosted',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: false,
          },
        },
        {
          id: 'blue',
          displayType: 'boosted',
          displayValue: 'blue',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: false,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    await userEvent.click(screen.getByLabelText('Move blue row up'));

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'MOVE_BOOSTED_ROW_UP',
      payload: {
        id: 'blue',
      },
    });
  });

  it('should select and deselect 1 row', async () => {
    const user = userEvent.setup({ delay: null });
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'boosted',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: false,
          },
        },
        {
          id: 'blue',
          displayType: 'boosted',
          displayValue: 'blue',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: false,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const checkbox = await screen.findByLabelText<HTMLInputElement>(
      'Select blue to merge'
    );

    act(() => {
      user.click(checkbox);
    });

    const mergeButtonBefore = await screen.findByText('Merge (1)');
    expect(mergeButtonBefore).toBeVisible();
    expect(mergeButtonBefore).toBeDisabled();
    expect(checkbox).toBeChecked();

    act(() => {
      user.click(checkbox);
    });

    const mergeButtonAfter = await screen.findByText('Merge (0)');
    expect(mergeButtonAfter).toBeVisible();
    expect(mergeButtonAfter).toBeDisabled();
    expect(checkbox).not.toBeChecked();
  });

  it('should select and deselect all rows', async () => {
    const user = userEvent.setup({ delay: null });
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'boosted',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: false,
          },
        },
        {
          id: 'blue',
          displayType: 'boosted',
          displayValue: 'blue',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: false,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });

    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const blueCheckbox = await screen.findByLabelText<HTMLInputElement>(
      'Select blue to merge'
    );
    const selectAllCheckbox = await screen.findByLabelText<HTMLInputElement>(
      'Select all facet attributes'
    );

    const mergeButtonBefore = await screen.findByText('Merge (0)');
    expect(mergeButtonBefore).toBeVisible();
    expect(mergeButtonBefore).toBeDisabled();
    expect(blueCheckbox).not.toBeChecked();
    expect(selectAllCheckbox).not.toBeChecked();

    act(() => {
      user.click(selectAllCheckbox);
    });

    const mergeButtonAfter = await screen.findByText('Merge (2)');
    expect(mergeButtonAfter).toBeVisible();
    expect(mergeButtonAfter).toBeEnabled();
    expect(blueCheckbox).toBeChecked();
    expect(selectAllCheckbox).toBeChecked();

    act(() => {
      user.click(selectAllCheckbox);
    });

    const mergeButtonFinal = await screen.findByText('Merge (0)');
    expect(mergeButtonFinal).toBeVisible();
    expect(mergeButtonFinal).toBeDisabled();
    expect(blueCheckbox).not.toBeChecked();
    expect(selectAllCheckbox).not.toBeChecked();
  });

  it('should rename the display value', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });

    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const renameButton = await screen.findByLabelText(
      'Edit display name for red'
    );
    await userEvent.click(renameButton);

    const inputField = await screen.findByLabelText('Edit red input field');

    expect(inputField).toHaveValue('red');

    await waitFor(async () => {
      await userEvent.clear(inputField);
      await userEvent.type(inputField, 'New merge name');
      await userEvent.keyboard('{enter}');
    });

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'RENAME_DISPLAY_VALUE',
      payload: {
        id: 'red',
        newDisplayValue: 'New merge name',
      },
    });
  });

  it('should allow edit display value to the same name', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });

    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const renameButton = await screen.findByLabelText(
      'Edit display name for red'
    );
    await userEvent.click(renameButton);

    const inputField = await screen.findByLabelText('Edit red input field');

    expect(inputField).toHaveValue('red');

    await waitFor(async () => {
      await userEvent.clear(inputField);
      await userEvent.type(inputField, 'red');
    });

    const saveButton = await screen.findByLabelText('Save red change');

    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.queryByText('red is not a unique value')
      ).not.toBeInTheDocument();
    });

    expect(inputField).not.toBeVisible();
    expect(dispatchMock).toHaveBeenCalledTimes(0);
  });

  it('should not allow edit display value to the same name as another edited value', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'Cotton',
          displayType: 'default',
          displayValue: 'Cotton',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
        {
          id: 'McDuck',
          displayType: 'default',
          displayValue: 'McDuck',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        mergeEnabled={true}
        category="SubCategory_507"
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Cotton'],
          merged: [
            {
              displayValue: 'McDuck',
              mergedValues: ['Duck Down', 'Silk'],
            },
          ],
        }}
      />
    );

    expect(screen.getAllByText('Cotton')[0]).toBeVisible();

    const editButton = await screen.findByRole('button', {
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
    await userEvent.type(editCottonInput, 'McDuck');
    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(screen.getByText('McDuck is not a unique value')).toBeVisible();
    });
  });

  it('should merge selected facet attributes', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'boosted',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: false,
          },
        },
        {
          id: 'blue',
          displayType: 'boosted',
          displayValue: 'blue',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: false,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });

    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const selectAllCheckbox = await screen.findByLabelText<HTMLInputElement>(
      'Select all facet attributes'
    );

    await userEvent.click(selectAllCheckbox);

    const mergeButton = await screen.findByText('Merge (2)');
    await userEvent.click(mergeButton);

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'MERGE_SELECTED_ATTRIBUTE_VALUES',
      payload: {
        selectedFacetAttributeValues: ['red', 'blue'],
        displayValue: 'Name your merge',
      },
    });
  });

  it('should remove merged value', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'merged',
          mergedValues: ['red', 'blue'],
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });

    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const removeButton = await screen.findByLabelText(
      'Remove merged facet for blue'
    );
    await userEvent.click(removeButton);

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'REMOVE_MERGED_VALUE',
      payload: {
        mergeGroupDisplayName: 'red',
        attributeToRemove: 'blue',
      },
    });
  });

  it('should change the display type', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });

    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const select = await screen.findByTestId(
      'button to open facet order dropdown for red'
    );

    await userEvent.click(select);

    const includeOnlyButton = await screen.findByText('Include only');

    await userEvent.click(includeOnlyButton);

    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'CHANGE_DISPLAY_TYPE',
      payload: {
        id: 'red',
        newDisplayType: 'boosted',
      },
    });

    await userEvent.click(select);

    const excludeButton = await screen.findByText('Exclude only');

    await userEvent.click(excludeButton);

    expect(dispatchMock).toHaveBeenCalledTimes(2);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'CHANGE_DISPLAY_TYPE',
      payload: {
        id: 'red',
        newDisplayType: 'excluded',
      },
    });
  });

  it('should close the modal', async () => {
    const onClose = jest.fn();
    renderWithProviders(
      <EditFacetModalV2
        onClose={onClose}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const closeButton = await screen.findByLabelText('Close attributes modal');

    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should save the modal', async () => {
    const onSave = jest.fn();
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={onSave}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const saveButton = await screen.findByText('Save');

    await userEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('should search for a value', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });

    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const searchInput = await screen.findByPlaceholderText('Search...');

    await userEvent.type(searchInput, 'blue');

    await waitFor(() => {
      expect(useAttributeValuesRowsSelector).toHaveBeenCalledTimes(2);
    });

    expect(useAttributeValuesRowsSelector).toHaveBeenCalledWith(
      facetMock,
      'blue',
      'SubCategory_507'
    );
  });

  it('should disable the save button when display value is not finished renaming', async () => {
    jest.mocked(useReducer).mockReturnValue([
      {
        ...facetMock,
        merged: [
          {
            displayValue: 'Name your merge',
            mergedValues: ['red', 'blue'],
          },
        ],
      },
      dispatchMock,
    ]);
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'red',
          displayType: 'default',
          displayValue: 'red',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });

    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        facet={facetMock}
        mergeEnabled={true}
        category="SubCategory_507"
      />
    );

    const saveButton = await screen.findByText('Save');
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('should not be able to edit a display value to the same name as another edited value', async () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      attributeValuesState: [
        {
          id: 'Cotton',
          displayType: 'default',
          displayValue: 'Cotton',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
        {
          id: 'McDuck',
          displayType: 'default',
          displayValue: 'McDuck',
          mergeType: 'unmerged',
          meta: {
            isBeginningOfDisplayTypeGroup: true,
            isEndOfDisplayTypeGroup: true,
          },
        },
      ],
    });
    renderWithProviders(
      <EditFacetModalV2
        onClose={jest.fn()}
        onSave={jest.fn()}
        mergeEnabled={true}
        category="SubCategory_507"
        facet={{
          displayValue: 'color',
          indexPropertyName: 'color',
          id: '1',
          lastChanged: { user: 'Bob', date: '2021-10-01' },
          boosted: ['Cotton'],
          merged: [
            {
              displayValue: 'McDuck',
              mergedValues: ['Duck Down', 'Silk'],
            },
          ],
        }}
      />
    );

    expect(screen.getAllByText('Cotton')[0]).toBeVisible();

    const editButton = await screen.findByRole('button', {
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
    await userEvent.type(editCottonInput, 'McDuck');

    const saveButton = screen.getByRole('button', {
      name: 'Save Cotton change',
    });

    expect(saveButton).toBeDisabled();
  });
});
