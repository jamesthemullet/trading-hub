import { screen, waitFor, within } from '@testing-library/react';
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
  }));

  const defaultProps: GlobalFacetAttributesListProps = {
    attributeValues: [
      { displayValue: '13 - 14.4' },
      { displayValue: '10 - 12.9' },
      { displayValue: '14.5 - 20' },
      { displayValue: 'Under 10' },
      { displayValue: 'Over 20' },
    ],
    searchQuery: '',
    countryCode: 'UK' as MerchandisingCountryCode,
    editingValues: [],
    dispatch: jest.fn(),
    globalAttributesLocalState: {
      selectedAttributes: [],
      allSelected: false,
      allDeselected: false,
      disableArrows: false,
      boostedRows: formattedRows.slice(0, 2),
      nonBoostedExcludedRows: formattedRows.slice(2, 4),
      excludedRows: formattedRows.slice(4),
      merged: [],
      errorStates: {},
    },
    writeEnabled: true,
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

    const excludeOption = within(boostedRow).getByRole('option', {
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

    const includedOption = within(boostedRow).getByRole('option', {
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
    const excludeOption = within(boostedRow).getByRole('option', {
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
    const excludeOption2 = within(algoRow).getByRole('option', {
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
    const includeOption = within(excludedRow).getByRole('option', {
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
});
