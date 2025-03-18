import { useReducer } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { CountryCode } from '@/libs/api';
import { useCheckMergeNameUnique, useGlobalFacetUpdate } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import EditFacetModalContent from './edit-facet-modal-content';
import { useAttributeValuesRowsSelector } from './use-attribute-values-rows-selector';

jest.mock('./use-attribute-values-rows-selector', () => ({
  ...jest.requireActual('./use-attribute-values-rows-selector'),
  useAttributeValuesRowsSelector: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-global-facet-update', () => ({
  ...jest.requireActual('@/libs/hooks/global/facets/use-global-facet-update'),
  useGlobalFacetUpdate: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useReducer: jest.fn(),
}));

const dispatchMock = jest.fn();

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

const countryCode: CountryCode = 'UK';

const mockDefaultCategoryProps = {
  facet: facetMock,
  categories: ['SubCategory_507'],
  mergeEnabled: false,
  displayValueEditEnabled: false,
  removeFacetValueFromMergeGroupEnabled: false,
  defaultMergedDisplayValue: 'Name your merge',
  dispatch: dispatchMock,
  handleDisableSaveButton: jest.fn(),
  countryCode,
};

const mockDefaultGlobalProps = {
  facet: facetMock,
  category: 'global',
  mergeEnabled: true,
  displayValueEditEnabled: true,
  removeFacetValueFromMergeGroupEnabled: true,
  defaultMergedDisplayValue: 'Name your merge',
  dispatch: dispatchMock,
  handleDisableSaveButton: jest.fn(),
  countryCode,
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
    {
      id: 'blue',
      displayType: 'default',
      displayValue: 'blue',
      mergeType: 'unmerged',
      meta: {
        isBeginningOfDisplayTypeGroup: true,
        isEndOfDisplayTypeGroup: true,
      },
    },
  ],
  error: '',
};

describe('Edit Facet Modal Content', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(useAttributeValuesRowsSelector)
      .mockReturnValue(useAttributeValuesRowsSelectorReturnMock);
    jest.mocked(useGlobalFacetUpdate).mockReturnValue({
      handleGlobalFacetUpdate: jest.fn(),
      error: '',
    });
    jest.mocked(useCheckMergeNameUnique).mockReturnValue({
      checkMergeNameUnique: () =>
        Promise.resolve({
          isUniqueValue: true,
        }),
      error: '',
    });
    jest.mocked(useReducer).mockReturnValue([facetMock, dispatchMock]);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should render the EditFacetModalContent component', () => {
    renderWithProviders(
      <EditFacetModalContent {...mockDefaultCategoryProps} />
    );
    expect(screen.getByText('Facet value settings of: color')).toBeVisible();

    expect(screen.getByText('2 results')).toBeVisible();
  });

  it('should render loading state', () => {
    jest.mocked(useAttributeValuesRowsSelector).mockReturnValue({
      ...useAttributeValuesRowsSelectorReturnMock,
      isLoading: true,
    });
    renderWithProviders(
      <EditFacetModalContent {...mockDefaultCategoryProps} />
    );

    expect(screen.getByText('Facet value settings of: color')).toBeVisible();

    expect(screen.getByText('2 results')).toBeVisible();

    expect(useAttributeValuesRowsSelector).toHaveBeenCalledTimes(1);
    expect(useAttributeValuesRowsSelector).toHaveBeenCalledWith(
      facetMock,
      '',
      'UK',
      ['SubCategory_507']
    );

    expect(screen.getAllByTestId('attribute-value-skeleton')[0]).toBeVisible();
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
    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

    expect(await screen.findByTestId('Merged value red label')).toBeVisible();

    expect(
      await screen.findByLabelText('Remove merged facet for red')
    ).toBeVisible();

    expect(
      await screen.findByTestId('Merged value scarlet label')
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
    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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
    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

    expect(await screen.findByTestId('Merged value red label')).toBeVisible();

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
    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

    expect(await screen.findByTestId('Merged value red label')).toBeVisible();

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
    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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
    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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
    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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

    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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
    mockUseCheckMergeNameUnique.checkMergeNameUnique = jest.fn(() =>
      Promise.resolve({ isUniqueValue: true })
    );
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

    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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

    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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
      <EditFacetModalContent
        {...mockDefaultGlobalProps}
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

    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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

    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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

    renderWithProviders(<EditFacetModalContent {...mockDefaultGlobalProps} />);

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
      <EditFacetModalContent {...mockDefaultCategoryProps} />
    );

    const searchInput = await screen.findByPlaceholderText('Search...');

    await userEvent.type(searchInput, 'blue');

    await waitFor(() => {
      expect(useAttributeValuesRowsSelector).toHaveBeenCalledTimes(2);
    });

    expect(useAttributeValuesRowsSelector).toHaveBeenLastCalledWith(
      facetMock,
      'blue',
      'UK',
      ['SubCategory_507']
    );
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
      <EditFacetModalContent
        {...mockDefaultCategoryProps}
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
        displayValueEditEnabled={true}
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

  describe('Merge functionality', () => {
    it('should not show merge options if not enabled', async () => {
      renderWithProviders(
        <EditFacetModalContent {...mockDefaultCategoryProps} />
      );

      expect(
        screen.queryByRole('button', { name: 'Merge (0)' })
      ).not.toBeInTheDocument();
      expect(screen.queryAllByRole('checkbox').length).toBe(0);
    });

    it('should disable the merge button if less than two attributes selected', () => {
      renderWithProviders(
        <EditFacetModalContent {...mockDefaultGlobalProps} />
      );
      const mergeButton = screen.getByRole('button', { name: 'Merge (0)' });
      expect(mergeButton).toBeDisabled();
    });

    it('should enable the merge button if two attributes selected', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalContent {...mockDefaultGlobalProps} />
      );
      const cottonCheckbox = screen.getByLabelText('Select red to merge');
      const duckDownCheckbox = screen.getByLabelText('Select blue to merge');

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
    });

    it('should unselect a merged value', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalContent {...mockDefaultGlobalProps} />
      );
      act(() => {
        user.click(screen.getByLabelText('Select red to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (1)' })).toBeVisible();
      });
      act(() => {
        user.click(screen.getByLabelText('Select red to merge'));
      });
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
      });
    });

    it('should select and deselect all facet attributes', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <EditFacetModalContent {...mockDefaultGlobalProps} />
      );
      const selectAll = screen.getByLabelText('Select all facet attributes');

      act(() => {
        user.click(selectAll);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (2)' })).toBeVisible();
      });

      act(() => {
        user.click(selectAll);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Merge (0)' })).toBeVisible();
      });
    });
  });
});
