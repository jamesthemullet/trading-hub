import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingCountryCode } from '@/libs/api';
import { FacetType } from '@/libs/constants/rule-types';
import { renderWithProviders } from '@/test/render-with-providers';

import type { FacetRowProps } from './facet-row';
import { FacetRow } from './facet-row';

const mockDispatch = jest.fn();
const mockSaveDraft = jest.fn();
const mockPush = jest.fn();
const mockSaveAndContinue = jest.fn();

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
  useRouter: jest.fn(),
}));

const defaultProps: FacetRowProps = {
  displayValue: 'color',
  displayType: 'algoControl',
  id: 'color-123',
  indexPropertyName: 'color',
  index: 0,
  isWriteEnabled: true,
  onDispatch: mockDispatch,
  hasChanges: false,
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
  countryCode: 'UK_IE',
  rulesetId: 'test-ruleset-id',
  currentRuleset: mockRuleset,
  onSaveAndContinue: mockSaveAndContinue,
};

describe('FacetRow', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      query: {},
      pathname: '',
    });
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
        isWriteEnabled={false}
      />
    );

    const link = screen.getByRole('link', { name: 'View values' });
    expect(link).toBeInTheDocument();
  });

  it('should render edit values button for included facets with isWriteEnabled', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        isWriteEnabled
      />
    );

    const editButton = screen.getByRole('link', { name: 'Edit values' });
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);
  });

  it('should not render an edit/view values button for global facets', () => {
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        facetType={FacetType.Global}
      />
    );

    expect(
      screen.queryByRole('link', { name: 'Edit values' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'View values' })
    ).not.toBeInTheDocument();
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
        isWriteEnabled
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
        isWriteEnabled
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
        isWriteEnabled
        isNewRuleset={false}
        currentRuleset={mockRuleset}
      />
    );

    const editButton = screen.getByRole('link', { name: 'Edit values' });
    await user.click(editButton);

    expect(mockSaveDraft).not.toHaveBeenCalled();
  });

  it('should show unsaved changes modal when hasChanges is true and edit values is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        isWriteEnabled
        hasChanges
      />
    );

    await user.click(screen.getByRole('link', { name: 'Edit values' }));

    expect(
      screen.getByRole('heading', { name: 'You have unsaved changes' })
    ).toBeInTheDocument();
  });

  it('should save and continue (not navigate straight away) when confirming the unsaved changes modal for an existing ruleset', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        isWriteEnabled
        hasChanges
      />
    );

    await user.click(screen.getByRole('link', { name: 'Edit values' }));
    await user.click(
      screen.getByRole('button', { name: 'Save changes and continue' })
    );

    expect(mockSaveAndContinue).toHaveBeenCalledWith(expect.any(Function));
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSaveDraft).not.toHaveBeenCalled();

    const [navigateToEditValues] = mockSaveAndContinue.mock.calls[0];
    navigateToEditValues();

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/facets/values/edit/color-123')
    );
  });

  it('should save the draft and navigate straight to edit values when confirming for a new ruleset', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        isWriteEnabled
        hasChanges
        isNewRuleset
      />
    );

    await user.click(screen.getByRole('link', { name: 'Edit values' }));
    await user.click(
      screen.getByRole('button', { name: 'Save changes and continue' })
    );

    expect(mockSaveDraft).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/facets/values/edit/color-123')
    );
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  });

  it('should close unsaved changes modal and stay on page when continuing to edit', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        isWriteEnabled
        hasChanges
      />
    );

    await user.click(screen.getByRole('link', { name: 'Edit values' }));
    expect(
      screen.getByRole('heading', { name: 'You have unsaved changes' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Stay on page' }));

    expect(
      screen.queryByRole('heading', { name: 'You have unsaved changes' })
    ).not.toBeInTheDocument();
  });

  it('should show the newly-included warning in the modal when isNewlyIncluded is true', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        isWriteEnabled
        hasChanges
        isNewlyIncluded
      />
    );

    await user.click(screen.getByRole('link', { name: 'Edit values' }));

    expect(
      screen.getByRole('heading', { name: 'Save required to continue' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Your changes will be saved before you continue to Edit facet values/i
      )
    ).toBeInTheDocument();
  });

  it('should render unavailable facet with ghost styling and "currently not available" text', () => {
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
        isUnavailable
      />
    );

    const row = screen.getByTestId('Row showing color as included');
    expect(row).toHaveAttribute('data-unavailable', 'true');
    expect(screen.getByText('— currently not available')).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Edit values' })
    ).not.toBeInTheDocument();
  });

  it('should not show "currently not available" for available facets', () => {
    renderWithProviders(
      <FacetRow
        {...includedProps}
        displayType="included"
        isDragDisabled={false}
      />
    );

    const row = screen.getByTestId('Row showing color as included');
    expect(row).not.toHaveAttribute('data-unavailable');
    expect(
      screen.queryByText('— currently not available')
    ).not.toBeInTheDocument();
  });
});
