import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import type { FacetRowProps } from './facet-row';
import { FacetRow } from './facet-row';

const mockDispatch = jest.fn();
const mockSetIsFacetValuesModalOpen = jest.fn();
const mockSetSelectedFacet = jest.fn();

const defaultProps: FacetRowProps = {
  displayValue: 'color',
  displayType: 'algoControl',
  id: 'color-123',
  indexPropertyName: 'color',
  index: 0,
  writeEnabled: true,
  onDispatch: mockDispatch,
  lastChanged: {
    date: '2021-01-01T08:34:15Z',
    user: 'Test User',
  },
};
const includedProps: FacetRowProps = {
  ...defaultProps,
  displayType: 'included',
  includedFacetOrder: [],
  localOrders: {},
  handleInputChange: jest.fn(),
  handleInputBlur: jest.fn(),
  handleInputKeyDown: jest.fn(),
  handleFacetOrderInputRef: jest.fn(() => jest.fn()),
  isDragDisabled: false,
  showNewFacetValuesPage: true,
  selectedCategories: [],
  selectedSearchTerms: [],
  facetType: 'category',
  countryCode: 'UK_IE',
  rulesetId: 'test-ruleset-id',
  onSetIsFacetValuesModalOpen: mockSetIsFacetValuesModalOpen,
  onSetSelectedFacet: mockSetSelectedFacet,
  rulesetFacets: [],
};

describe('FacetRow', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render facet row with correct display values', () => {
    renderWithProviders(<FacetRow {...defaultProps} />);

    const colorTexts = screen.getAllByText('color');
    expect(colorTexts.length).toBeGreaterThan(0);
    expect(
      screen.getByTestId('Row showing color as algoControl')
    ).toBeInTheDocument();
  });

  it('should call onDispatch when changing display type', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<FacetRow {...defaultProps} />);

    const dropdown = screen.getByTestId('button to open facet order dropdown');
    await user.click(dropdown);

    const excludeOption = screen.getByText('Exclude only');
    await user.click(excludeOption);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'facetChangeDisplayType',
      payload: {
        id: 'color-123',
        newType: 'excluded',
        oldType: 'algoControl',
      },
    });
  });

  it('should render edit values button for included facets with writeEnabled', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        writeEnabled
        showNewFacetValuesPage={false}
        rulesetFacets={[{ id: 'color-123', boosted: [], excludedValues: [] }]}
      />
    );

    const editButton = screen.getByRole('button', { name: 'Edit values' });
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);

    expect(mockSetIsFacetValuesModalOpen).toHaveBeenCalledWith(true);
    expect(mockSetSelectedFacet).toHaveBeenCalled();
  });

  it('should render view values button for read-only included facets', () => {
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        writeEnabled={false}
        showNewFacetValuesPage
      />
    );

    const link = screen.getByRole('link', { name: 'View values' });
    expect(link).toBeInTheDocument();
  });

  it('should render excluded facet type correctly', () => {
    renderWithProviders(<FacetRow {...defaultProps} displayType="excluded" />);

    expect(
      screen.getByTestId('Row showing color as excluded')
    ).toBeInTheDocument();
  });

  it('should use default countryCode when countryCode is falsy', () => {
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        countryCode=""
        showNewFacetValuesPage
      />
    );

    const link = screen.getByRole('link', { name: 'Edit values' });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('countryCode=UK_IE')
    );
  });
});
