import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GlobalFacetAttributesListProps } from './global-facet-attributes-list';
import { GlobalFacetAttributesList } from './global-facet-attributes-list';

describe('FacetAttributesList', () => {
  const formattedRows = [
    '13 - 14.4',
    '10 - 12.9',
    '14.5 - 20',
    'Under 10',
    'Over 20',
  ].map((displayName) => ({
    displayName,
    attributes: [displayName],
    isMergeGroup: false,
    isChecked: false,
  }));

  const dispatchMock = jest.fn();

  const defaultProps: GlobalFacetAttributesListProps = {
    attributeValues: [
      { displayValue: '13 - 14.4' },
      { displayValue: '10 - 12.9' },
      { displayValue: '14.5 - 20' },
      { displayValue: 'Under 10' },
      { displayValue: 'Over 20' },
    ],
    setIsAwaitingUpdate: jest.fn(),
    isAwaitingUpdate: false,
    searchQuery: '',
    countryCode: 'UK' as MerchandisingCountryCode,
    editingValues: [],
    dispatch: dispatchMock,
    globalAttributesLocalState: {
      boostedRows: formattedRows.slice(0, 2).map((row, index) => ({
        ...row,
        order: index + 1,
      })),
      nonBoostedExcludedRows: formattedRows.slice(2, 4),
      excludedRows: formattedRows.slice(4),
      merged: [],
      errorStates: {},
      currentMerge: {
        isOpen: false,
        displayValue: '',
        mergedValues: [],
        demergedValues: [],
        currentMergeValues: [],
      },
    },
    isWriteEnabled: true,
    setEditingValues: jest.fn(),
    facet: {
      id: 'color',
      boosted: [],
      excludedValues: [],
      merged: [],
      indexPropertyName: 'colorIndex',
      displayValue: 'Color',
      lastChanged: {
        date: '2023-01-01',
        user: 'test-user',
      },
    } as MerchandisingReturnedGlobalFacet,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with default props', () => {
    renderWithProviders(<GlobalFacetAttributesList {...defaultProps} />);

    formattedRows.forEach(({ displayName }) => {
      expect(screen.getByTestId(`Label for ${displayName}`)).toHaveTextContent(
        displayName
      );
    });
  });

  it('filters rows based on search query', () => {
    renderWithProviders(
      <GlobalFacetAttributesList {...defaultProps} searchQuery="Under" />
    );

    expect(screen.getByTestId('Label for Under 10')).toHaveTextContent(
      'Under 10'
    );
    expect(screen.queryByTestId('Label for 13 - 14.4')).not.toBeInTheDocument();
    expect(screen.queryByTestId('Label for 10 - 12.9')).not.toBeInTheDocument();
    expect(screen.queryByTestId('Label for 14.5 - 20')).not.toBeInTheDocument();
    expect(screen.queryByTestId('Label for Over 20')).not.toBeInTheDocument();
  });

  it('dispatches actions when dropdown value changes', async () => {
    const user = userEvent.setup();
    const dispatchMock = jest.fn();

    renderWithProviders(
      <GlobalFacetAttributesList {...defaultProps} dispatch={dispatchMock} />
    );

    const boostedRow = screen.getByTestId('included attribute 0 13 - 14.4');
    const dropdownButton = within(boostedRow).getByRole('button', {
      name: /select to set as included, excluded or algo control/i,
    });
    await user.click(dropdownButton);

    const excludeOption = within(boostedRow).getByRole('menuitemradio', {
      name: /exclude only/i,
    });
    await user.click(excludeOption);

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'AMEND_BOOSTED_ROW',
        })
      );
    });
  });

  it('renders filtered results panel with correct count', () => {
    renderWithProviders(<GlobalFacetAttributesList {...defaultProps} />);

    expect(screen.getByText(/5\s+results/i)).toBeInTheDocument();
  });

  it('filters rows by attribute and merged group', () => {
    const mergedGroup = {
      displayValue: 'MergedGroup',
      mergedValues: ['MergedValue'],
    };
    const props = {
      ...defaultProps,
      attributeValues: [
        { displayValue: 'MergedValue' },
        { displayValue: 'OtherValue' },
      ],
      globalAttributesLocalState: {
        ...defaultProps.globalAttributesLocalState,
        merged: [mergedGroup],
      },
      searchQuery: 'Merged',
    };
    renderWithProviders(<GlobalFacetAttributesList {...props} />);

    expect(screen.getByText('1 result')).toBeInTheDocument();
  });

  it('onOrderChange returns early if status matches displayType', async () => {
    const dispatchMock = jest.fn();
    const props = {
      ...defaultProps,
      dispatch: dispatchMock,
    };
    renderWithProviders(<GlobalFacetAttributesList {...props} />);
    const boostedRow = screen.getByTestId('included attribute 0 13 - 14.4');
    const dropdownButton = within(boostedRow).getByRole('button', {
      name: /select to set as included, excluded or algo control/i,
    });
    await userEvent.click(dropdownButton);

    const includedOption = within(boostedRow).getByRole('menuitemradio', {
      name: /include only/i,
    });
    await userEvent.click(includedOption);

    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('onOrderChange dispatches correct action for each displayType', async () => {
    const dispatchMock = jest.fn();
    const props = {
      ...defaultProps,
      dispatch: dispatchMock,
    };
    renderWithProviders(<GlobalFacetAttributesList {...props} />);

    const boostedRow = screen.getByTestId('included attribute 0 13 - 14.4');
    const dropdownButton = within(boostedRow).getByRole('button', {
      name: /select to set as included, excluded or algo control/i,
    });
    await userEvent.click(dropdownButton);
    const excludeOption = within(boostedRow).getByRole('menuitemradio', {
      name: /exclude only/i,
    });
    await userEvent.click(excludeOption);
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'AMEND_BOOSTED_ROW' })
      );
    });

    const algoRow = screen.getByTestId('algoControl attribute 0 14.5 - 20');
    const algoDropdown = within(algoRow).getByRole('button', {
      name: /select to set as included, excluded or algo control/i,
    });
    await userEvent.click(algoDropdown);
    const excludeOption2 = within(algoRow).getByRole('menuitemradio', {
      name: /exclude only/i,
    });
    await userEvent.click(excludeOption2);
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'AMEND_NONBOOSTEDEXCLUDED_ROW' })
      );
    });

    const excludedRow = screen.getByTestId('excluded attribute 0 Over 20');
    const excludedDropdown = within(excludedRow).getByRole('button', {
      name: /select to set as included, excluded or algo control/i,
    });
    await userEvent.click(excludedDropdown);
    const includeOption = within(excludedRow).getByRole('menuitemradio', {
      name: /include only/i,
    });
    await userEvent.click(includeOption);
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'AMEND_EXCLUDED_ROW' })
      );
    });
  });

  it('filters merged groups by mergedValues substring match (covers group.mergedValues?.some)', () => {
    const mergedGroup = {
      displayValue: 'MergedGroup',
      mergedValues: ['SpecialValue', 'OtherValue'],
    };
    const props = {
      ...defaultProps,
      attributeValues: [{ displayValue: 'Unrelated' }],
      globalAttributesLocalState: {
        ...defaultProps.globalAttributesLocalState,
        merged: [mergedGroup],
      },
      searchQuery: 'special', // should match 'SpecialValue' (case-insensitive)
    };
    renderWithProviders(<GlobalFacetAttributesList {...props} />);
    // Should show 1 result (the merged group)
    expect(screen.getByText('1 result')).toBeInTheDocument();
  });

  it('calculates totalFilteredResults for merged and non-merged attributes', () => {
    const mergedGroup = {
      displayValue: 'MergedGroup',
      mergedValues: ['MergedValue'],
    };
    const props = {
      ...defaultProps,
      attributeValues: [
        { displayValue: 'MergedValue' },
        { displayValue: 'OtherValue' },
      ],
      globalAttributesLocalState: {
        ...defaultProps.globalAttributesLocalState,
        merged: [mergedGroup],
      },
      searchQuery: 'Merged',
    };
    renderWithProviders(<GlobalFacetAttributesList {...props} />);

    expect(screen.getByText('1 result')).toBeInTheDocument();
  });

  describe('re-ordering by number', () => {
    beforeEach(() => {
      Element.prototype.scrollIntoView = jest.fn();
    });

    it('should dispatch SET_BOOSTED_ORDER if new value within the range of boosted items', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<GlobalFacetAttributesList {...defaultProps} />);

      const input = screen.getByLabelText('Order for 13 - 14.4');
      expect(input).toHaveValue(1);
      await user.clear(input);
      await user.type(input, '2');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(dispatchMock).toHaveBeenCalledWith({
          type: 'SET_BOOSTED_ORDER',
          payload: { id: '13 - 14.4', newIndex: 1 },
        });
      });
    });

    it('should not change order if new value is less than 1', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<GlobalFacetAttributesList {...defaultProps} />);

      const input = screen.getByLabelText('Order for 10 - 12.9');
      expect(input).toHaveValue(2);
      await user.type(input, '0');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(dispatchMock).toHaveBeenCalledWith({
          type: 'SET_BOOSTED_ORDER',
          payload: { id: '10 - 12.9', newIndex: 1 },
        });
        expect(input).toHaveValue(2);
      });
    });

    it('should keep the existing order if the user deletes, then clicks outside without inputting a new order', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<GlobalFacetAttributesList {...defaultProps} />);

      const input = screen.getByLabelText('Order for 10 - 12.9');
      expect(input).toHaveValue(2);
      await user.clear(input);
      expect(input).toHaveValue(null);
      act(() => {
        input.blur();
      });

      await waitFor(() => {
        expect(dispatchMock).not.toHaveBeenCalledWith({
          type: 'SET_BOOSTED_ORDER',
          payload: expect.any(Object),
        });
        expect(input).toHaveValue(2);
      });
    });

    it('should keep the existing order if the user deletes, then clicks enter without inputting a new order', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<GlobalFacetAttributesList {...defaultProps} />);

      const input = screen.getByLabelText('Order for 13 - 14.4');
      expect(input).toHaveValue(1);
      await user.clear(input);
      expect(input).toHaveValue(null);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(dispatchMock).not.toHaveBeenCalledWith({
          type: 'SET_BOOSTED_ORDER',
          payload: expect.any(Object),
        });
        expect(input).toHaveValue(1);
      });
    });
  });

  it('dispatches REMOVE_FROM_MERGE_GROUP when removing a merged value', async () => {
    const user = userEvent.setup();
    const dispatchMock = jest.fn();

    const props = {
      ...defaultProps,
      dispatch: dispatchMock,
      globalAttributesLocalState: {
        ...defaultProps.globalAttributesLocalState,
        boostedRows: [
          {
            displayName: 'MergedGroup',
            attributes: ['13 - 14.4', '10 - 12.9'],
            isMergeGroup: true,
            isChecked: false,
            order: 1,
          },
        ],
        merged: [
          {
            displayValue: 'MergedGroup',
            mergedValues: ['13 - 14.4', '10 - 12.9'],
          },
        ],
      },
    };
    renderWithProviders(<GlobalFacetAttributesList {...props} />);

    const removeButton = screen.getByLabelText(
      'Remove merged facet for 10 - 12.9'
    );
    await user.click(removeButton);

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'REMOVE_FROM_MERGE_GROUP',
        payload: {
          valueToRemove: '10 - 12.9',
          mergeDisplayName: 'MergedGroup',
        },
      });
    });
  });

  it('toggles all attributes when header checkbox clicked', async () => {
    const user = userEvent.setup();
    const dispatchMock = jest.fn();
    const setIsAwaitingUpdateMock = jest.fn();

    const props = {
      ...defaultProps,
      dispatch: dispatchMock,
      setIsAwaitingUpdate: setIsAwaitingUpdateMock,
    };

    renderWithProviders(<GlobalFacetAttributesList {...props} />);

    const checkbox = screen.getByLabelText('Select all facet attributes');

    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });

    await user.click(checkbox);

    await waitFor(() => {
      expect(setIsAwaitingUpdateMock).toHaveBeenCalledWith(true);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'TOGGLE_ALL_ATTRIBUTES',
        payload: { areAllSelected: true },
      });
    });

    raf.mockRestore();
  });

  it('unselects all attributes when header checkbox clicked', async () => {
    const user = userEvent.setup();
    const dispatchMock = jest.fn();
    const setIsAwaitingUpdateMock = jest.fn();

    const props = {
      ...defaultProps,
      dispatch: dispatchMock,
      setIsAwaitingUpdate: setIsAwaitingUpdateMock,
      globalAttributesLocalState: {
        ...defaultProps.globalAttributesLocalState,
        boostedRows: defaultProps.attributeValues.map((val, index) => ({
          displayName: val.displayValue,
          attributes: [val.displayValue],
          isMergeGroup: false,
          isChecked: true,
          order: index + 1,
        })),
        nonBoostedExcludedRows: [],
        excludedRows: [],
        merged: [],
        errorStates: {},
        currentMerge: {
          isOpen: false,
          displayValue: '',
          mergedValues: [],
          demergedValues: [],
          currentMergeValues: [],
        },
      },
    };

    renderWithProviders(<GlobalFacetAttributesList {...props} />);

    const checkbox = screen.getByLabelText('Select all facet attributes');

    expect(checkbox).toBeChecked();

    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });

    await user.click(checkbox);

    await waitFor(() => {
      expect(setIsAwaitingUpdateMock).toHaveBeenCalledWith(true);
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'TOGGLE_ALL_ATTRIBUTES',
        payload: { areAllSelected: false },
      });
    });

    raf.mockRestore();
  });
});
