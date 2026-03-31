import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { MerchandisingCountryCode } from '@/libs/api';
import { FacetType } from '@/libs/constants/rule-types';
import { renderWithProviders } from '@/test/render-with-providers';

import type { FacetRowProps } from './facet-row';
import { FacetRow } from './facet-row';

const mockDispatch = jest.fn();
const mockSaveDraft = jest.fn();

const mockRuleset = {
  isEnabled: true,
  rules: {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
    buries: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  excludedFacets: { facets: [] },
  facets: [],
};

jest.mock('@/libs/hooks/use-draft-ruleset', () => ({
  useDraftRuleset: () => ({
    saveDraft: mockSaveDraft,
    getDraft: jest.fn(),
    clearDraft: jest.fn(),
    isDraftRuleset: jest.fn(),
  }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '',
  }),
}));

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
  selectedCategories: [],
  selectedSearchTerms: [],
  facetType: FacetType.Category,
  countryCode: 'UK_IE' as MerchandisingCountryCode,
  rulesetId: 'test-ruleset-id',
  currentRuleset: mockRuleset,
};

describe('FacetRow', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Suppress console.error for navigation not implemented in jsdom
    jest.spyOn(console, 'error').mockImplementation(() => {});
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

  it('should render view values button for read-only included facets', () => {
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        writeEnabled={false}
      />
    );

    const link = screen.getByRole('link', { name: 'View values' });
    expect(link).toBeInTheDocument();
  });

  it('should render edit values button for included facets with writeEnabled', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        writeEnabled
      />
    );

    const editButton = screen.getByRole('link', { name: 'Edit values' });
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);
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
      />
    );

    const link = screen.getByRole('link', { name: 'Edit values' });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('countryCode=UK_IE')
    );
  });

  it('should save draft to session storage when editing values for new ruleset with category facets', async () => {
    const user = userEvent.setup({ delay: null });
    const mockRuleset = {
      id: 'draft',
      isEnabled: true,
      startDate: undefined,
      endDate: undefined,
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        includes: { alphanumeric: [] },
        excludes: { alphanumeric: [] },
      },
      countryCode: 'UK_IE' as MerchandisingCountryCode,
      excludedFacets: { facets: [] },
      facets: [{ id: 'color-123', boosted: [], excludedValues: [] }],
    };

    const selectedCategories = ['cat-1', 'cat-2'];

    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        writeEnabled
        isNewRuleset
        currentRuleset={mockRuleset}
        selectedCategories={selectedCategories}
      />
    );

    const editButton = screen.getByRole('link', { name: 'Edit values' });
    await user.click(editButton);

    expect(mockSaveDraft).toHaveBeenCalledWith({
      ruleset: {
        ...mockRuleset,
        categoryIds: selectedCategories,
      },
      type: 'category',
    });
  });

  it('should save draft with search terms for new search ruleset', async () => {
    const user = userEvent.setup({ delay: null });
    const mockRuleset = {
      id: 'draft',
      isEnabled: true,
      startDate: undefined,
      endDate: undefined,
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        includes: { alphanumeric: [] },
        excludes: { alphanumeric: [] },
      },
      countryCode: 'UK_IE' as const,
      excludedFacets: { facets: [] },
      facets: [],
    };

    const searchTerms = ['test', 'search'];

    renderWithProviders(
      <FacetRow
        {...includedProps}
        // @ts-expect-error - rulesetId is required but we want to test the defaulting to 'draft' logic
        rulesetId={undefined}
        displayType="included"
        isDragDisabled={false}
        writeEnabled
        facetType={FacetType.Search}
        isNewRuleset
        currentRuleset={mockRuleset}
        selectedSearchTerms={searchTerms}
        rulesetFacets={[]}
      />
    );

    const editButton = screen.getByRole('link', { name: 'Edit values' });
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveAttribute(
      'href',
      expect.stringContaining('ruleSetId=draft')
    );
    await user.click(editButton);

    expect(mockSaveDraft).toHaveBeenCalledWith({
      ruleset: {
        ...mockRuleset,
        searchTerms,
      },
      type: 'search',
    });
  });

  it('should not save draft when isNewRuleset is false', async () => {
    const user = userEvent.setup({ delay: null });
    const mockRuleset = {
      id: 'existing-id',
      isEnabled: true,
      startDate: undefined,
      endDate: undefined,
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        includes: { alphanumeric: [] },
        excludes: { alphanumeric: [] },
      },
      countryCode: 'UK_IE' as MerchandisingCountryCode,
      excludedFacets: { facets: [] },
      facets: [],
    };

    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        writeEnabled
        isNewRuleset={false}
        currentRuleset={mockRuleset}
      />
    );

    const editButton = screen.getByRole('link', { name: 'Edit values' });
    await user.click(editButton);

    expect(mockSaveDraft).not.toHaveBeenCalled();
  });
});
