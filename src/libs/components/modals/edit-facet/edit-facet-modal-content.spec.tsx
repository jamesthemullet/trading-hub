import { useReducer } from 'react';
import { screen, waitFor } from '@testing-library/react';
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

jest.mock('@/libs/hooks/use-check-merge-name-unique', () => ({
  ...jest.requireActual('@/libs/hooks/use-check-merge-name-unique'),
  useCheckMergeNameUnique: jest.fn(),
}));

const facetMock = {
  displayValue: 'color',
  indexPropertyName: 'color',
  id: '1',
  lastChanged: { user: 'Bob', date: '2021-10-01' },
  boosted: [],
  excludedValues: [],
  merged: [],
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

const useAttributeValuesRowsSelectorReturnMock: ReturnType<
  typeof useAttributeValuesRowsSelector
> = {
  isLoading: false,
  attributeValues: [{ displayValue: 'red' }, { displayValue: 'blue' }],
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
      <EditFacetModalContent
        {...mockDefaultCategoryProps}
        facet={{
          ...mockDefaultCategoryProps.facet,
          merged: [{ displayValue: 'red', mergedValues: ['red', 'blue'] }],
          excludedValues: ['red', 'blue'],
        }}
      />
    );

    expect(await screen.findByTestId('Merged value red label')).toBeVisible();
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
      <EditFacetModalContent
        {...mockDefaultCategoryProps}
        facet={{ ...mockDefaultCategoryProps.facet, boosted: ['red', 'blue'] }}
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
      <EditFacetModalContent
        {...mockDefaultCategoryProps}
        facet={{ ...mockDefaultCategoryProps.facet, boosted: ['red', 'blue'] }}
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
      <EditFacetModalContent {...mockDefaultCategoryProps} />
    );

    const select = await screen.findByTestId(
      'button to open facet order dropdown for red'
    );

    await userEvent.click(select);

    const includeOnlyButton = screen.getAllByText('Include only')[0];

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

    const excludeButton = screen.getAllByText('Exclude only')[0];

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
});
