import { useReducer } from 'react';
import { act, Screen, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { ReturnedCategoryRuleSet, SearchPreviewResponseBeta } from '@/libs/api';
import {
  useFacetsList,
  useGetCategories,
  useGetFacetAttributeValues,
  usePreview,
} from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { mockMerchandisingRulesWithInfo } from '@/test/data/mock-merchandising-rules-with-info';
import { renderWithProviders } from '@/test/render-with-providers';

import CategoryFacetsPanel from './category-facets-panel';

const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  useFacetsList: jest.fn(),
  usePreview: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useReducer: jest.fn(),
}));

const CATEGORY_SEARCH_PLACEHOLDER_TEXT = 'Search...';
const categoryId1 = 'cat_123';
const categoryId2 = 'IE_cat123';
const categoryName1 = 'jeans';
const categoryPath1 = 'l/jeans';
const mockGetCategories = {
  categories: [
    {
      identifier: categoryId1,
      name: categoryName1,
      path: categoryPath1,
    },
    {
      identifier: categoryId2,
      name: categoryName1,
      path: categoryPath1,
    },
  ],
  pagination: { totalItems: 20 },
};

const mockRuleData: ReturnedCategoryRuleSet = {
  rules: {
    pinnedProducts: [{ id: 'xyz0' }],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  facets: [
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
    },
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
    },
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
    },
  ],
  excludedFacets: {
    facets: [
      {
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
      },
    ],
  },
  categoriesInfo: [{ id: categoryId1 }],
  isEnabled: true,
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};
const mockRuleDataCategoryIds = mockRuleData.categoriesInfo.map(
  (category) => category.id
);
const mockFacet = {
  displayValue: 'color',
  id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
  indexPropertyName: 'color',
  lastChanged: { date: '2021-01-01T08:34:15Z', user: 'Test User' },
  merged: [],
};

const mockData: SearchPreviewResponseBeta = {
  category: categoryId1,
  externalChanges: mockMerchandisingRulesWithInfo,
  facets: [
    {
      id: 'brand',
      order: 0,
      data: [
        {
          name: 'M&S Collection',
          count: 122,
          selected: false,
          disabled: false,
        },
        {
          name: 'Autograph',
          count: 7,
          selected: false,
          disabled: false,
        },
        {
          name: 'GOODMOVE',
          count: 4,
          selected: false,
          disabled: false,
        },
      ],
    },
  ],
  pagination: {
    totalItems: 1,
  },
  ruleSet: {
    facets: [mockFacet],
    rules: mockMerchandisingRulesWithInfo,
  },
  products: [],
};
const mockCategoryReturnValue = {
  data: mockData,
  error: '',
  isLoading: false,
  setFacetConfigRules: jest.fn(),
};

const selectCategory = async (screen: Screen, user: UserEvent) => {
  const input = screen.getAllByPlaceholderText(
    CATEGORY_SEARCH_PLACEHOLDER_TEXT
  )[0];
  await user.type(input, 'SubCategory_507{enter}');

  const categoryToSelect = await screen.findByText(
    `${categoryId1} | ${categoryName1} | ${categoryPath1}`
  );

  act(() => {
    categoryToSelect.click();
  });

  await waitFor(() => {
    expect(screen.getByText(categoryId1)).toBeVisible();
  });
};

const dispatchMock = jest.fn();

const onSaveSpy = jest.fn();
const onCancelSpy = jest.fn();
const refreshDataSpy = jest.fn();

const initialIncludedFacetsMock = [
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
  'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
];

const facetsPanelLocalStateMock = {
  includedFacets: initialIncludedFacetsMock,
  excludedFacets: [],
};

describe('Category Facet Panel', () => {
  beforeEach(() => {
    jest.mocked(useFacetsList).mockReturnValue(mockUseFacetsList);

    jest
      .mocked(useReducer)
      .mockReturnValue([facetsPanelLocalStateMock, dispatchMock]);

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

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

  it('should render the facet management editing page', async () => {
    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(onCancelSpy).toHaveBeenCalled();
  });

  it('should handle order change when button down is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
      type: 'MOVE_INCLUDED_ROW_DOWN',
    });
  });

  it('should handle order change when button up is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Move brand row up' }));

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86' },
      type: 'MOVE_INCLUDED_ROW_UP',
    });
  });

  it('should block order change when search is present', async () => {
    const user = userEvent.setup({ delay: null });
    const onFacetsDataRowOrderChangeSpy = jest.fn();

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    expect(onFacetsDataRowOrderChangeSpy).not.toHaveBeenCalled();
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSaveSpy).toHaveBeenCalled();
  });

  it('should select a category on user input, and clear category when "remove selected category" button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    await selectCategory(screen, user);

    expect(
      screen.queryAllByRole('button', { name: 'Remove category: cat_123' })
    ).toHaveLength(1);

    const clearButton = await screen.findByLabelText(
      'Remove category: cat_123'
    );

    act(() => {
      clearButton.click();
    });

    expect(
      screen.queryAllByRole('button', { name: 'Remove category: cat_123' })
    ).toHaveLength(0);
  });

  it('should show error and not add ruleset to the list if trying to add a duplicate ruleset', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    await selectCategory(screen, user);

    expect(
      screen.getByText('Ruleset cat_123 has already been added')
    ).toBeVisible();

    expect(
      screen.queryAllByRole('button', { name: 'Remove category: cat_123' })
    ).toHaveLength(1);
  });

  it('should highlight the row in the correct background colour depending on whether exclude/include only is selected', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    const dropdown = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];

    await user.click(dropdown);
    const includeOnlyOption = screen.getAllByText('Include only')[0];

    await user.click(includeOnlyOption);

    expect(screen.getAllByTestId(/Row showing/)[0]).toHaveStyle(
      'background-color: #f4faed'
    );

    await user.click(dropdown);
    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith({
        payload: {
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          newDisplayType: 'excluded',
        },
        type: 'CHANGE_DISPLAY_TYPE',
      });
    });
  });

  it('should show the schedule date picker', async () => {
    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    expect(screen.getByPlaceholderText('Select date range')).toHaveValue('');
  });

  it('should not show Edit Values button if facet is category and the facet is not included', async () => {
    jest.mocked(useReducer).mockReturnValue([
      {
        includedFacets: [],
        excludedFacets: [],
      },
      dispatchMock,
    ]);

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={[]}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    expect(screen.queryByText('Edit values')).not.toBeInTheDocument();
  });

  it('should initialise local reducer with correct data', async () => {
    jest.mocked(useReducer).mockReturnValue([
      {
        includedFacets: [],
        excludedFacets: [],
      },
      dispatchMock,
    ]);

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={mockRuleData.facets}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: {
        includedFacets: mockRuleData.facets?.map((facet) => facet.id),
        excludedFacets: mockRuleData.excludedFacets?.facets?.map(
          (facet) => facet.id
        ),
        countryCode: 'UK_IE',
      },
      type: 'INITIALISE_STATE',
    });
  });

  it('should initialise local reducer with empty included array if not passed', async () => {
    jest.mocked(useReducer).mockReturnValue([
      {
        includedFacets: [],
        excludedFacets: [],
      },
      dispatchMock,
    ]);

    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={undefined}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={false}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      payload: {
        includedFacets: [],
        excludedFacets: mockRuleData.excludedFacets?.facets?.map(
          (facet) => facet.id
        ),
        countryCode: 'UK_IE',
      },
      type: 'INITIALISE_STATE',
    });
  });

  it('should show skeleton when loading', async () => {
    renderWithProviders(
      <CategoryFacetsPanel
        ruleSetIncludedFacets={undefined}
        ruleSetExcludedFacets={mockRuleData.excludedFacets}
        ruleSetRules={mockRuleData.rules}
        startDate={mockRuleData.startDate}
        endDate={mockRuleData.endDate}
        isLoading={true}
        countryCode="UK_IE"
        categoryIds={mockRuleDataCategoryIds}
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        refreshData={refreshDataSpy}
      />
    );

    expect(() => screen.getByRole('button', { name: 'Save' })).toThrow(
      'Unable to find an accessible element with the role "button"'
    );
  });

  describe('Ireland', () => {
    it('should preview IE products with an IE category', async () => {
      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      jest.mocked(usePreview).mockReturnValue(mockCategoryReturnValue);

      renderWithProviders(
        <CategoryFacetsPanel
          ruleSetIncludedFacets={undefined}
          ruleSetExcludedFacets={mockRuleData.excludedFacets}
          ruleSetRules={mockRuleData.rules}
          startDate={mockRuleData.startDate}
          endDate={mockRuleData.endDate}
          isLoading={false}
          countryCode="UK_IE"
          categoryIds={[categoryId2]}
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          refreshData={refreshDataSpy}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });

      expect(usePreview).toHaveBeenCalledWith(
        expect.objectContaining({ countryCode: 'IE' })
      );
    });

    it('should preview IE products when selecting an IE category', async () => {
      const user = userEvent.setup({ delay: null });
      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      jest.mocked(usePreview).mockReturnValue(mockCategoryReturnValue);

      renderWithProviders(
        <CategoryFacetsPanel
          ruleSetIncludedFacets={undefined}
          ruleSetExcludedFacets={mockRuleData.excludedFacets}
          ruleSetRules={mockRuleData.rules}
          startDate={mockRuleData.startDate}
          endDate={mockRuleData.endDate}
          isLoading={false}
          countryCode="UK_IE"
          categoryIds={mockRuleDataCategoryIds}
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          refreshData={refreshDataSpy}
        />
      );

      await user.type(
        screen.getAllByPlaceholderText(CATEGORY_SEARCH_PLACEHOLDER_TEXT)[0],
        'IE_SubCategory_507{enter}'
      );

      const categoryToSelect = await screen.findByText(
        `${categoryId2} | ${categoryName1} | ${categoryPath1}`
      );

      act(() => {
        categoryToSelect.click();
      });

      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });

      expect(usePreview).toHaveBeenCalledWith(
        expect.objectContaining({ countryCode: 'IE' })
      );
    });

    it('should preview IE products when an IE category is selected after viewing a UK category', async () => {
      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      jest.mocked(usePreview).mockReturnValue(mockCategoryReturnValue);

      renderWithProviders(
        <CategoryFacetsPanel
          ruleSetIncludedFacets={undefined}
          ruleSetExcludedFacets={mockRuleData.excludedFacets}
          ruleSetRules={mockRuleData.rules}
          startDate={mockRuleData.startDate}
          endDate={mockRuleData.endDate}
          isLoading={false}
          countryCode="UK_IE"
          categoryIds={[categoryId1, categoryId2]}
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          refreshData={refreshDataSpy}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });

      expect(usePreview).toHaveBeenCalledWith(
        expect.objectContaining({ countryCode: 'UK' })
      );

      const closeButton = screen.getByLabelText('close modal');

      act(() => {
        closeButton.click();
      });

      const IECategory = screen.getByRole('button', { name: categoryId2 });

      act(() => {
        IECategory.click();
      });

      act(() => {
        previewButton.click();
      });

      expect(usePreview).toHaveBeenCalledWith(
        expect.objectContaining({ countryCode: 'IE' })
      );
    });

    it('should preview UK products when a UK category is selected after viewing an IE category', async () => {
      jest.mocked(useGetCategories).mockReturnValue({
        getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
        getCategoriesError: '',
      });

      jest.mocked(usePreview).mockReturnValue(mockCategoryReturnValue);

      renderWithProviders(
        <CategoryFacetsPanel
          ruleSetIncludedFacets={undefined}
          ruleSetExcludedFacets={mockRuleData.excludedFacets}
          ruleSetRules={mockRuleData.rules}
          startDate={mockRuleData.startDate}
          endDate={mockRuleData.endDate}
          isLoading={false}
          countryCode="UK_IE"
          categoryIds={[categoryId2, categoryId1]}
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          refreshData={refreshDataSpy}
        />
      );

      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });

      expect(usePreview).toHaveBeenCalledWith(
        expect.objectContaining({ countryCode: 'IE' })
      );

      const closeButton = screen.getByLabelText('close modal');

      act(() => {
        closeButton.click();
      });

      const UKCategory = screen.getByRole('button', { name: categoryId1 });

      act(() => {
        UKCategory.click();
      });

      act(() => {
        previewButton.click();
      });

      expect(usePreview).toHaveBeenCalledWith(
        expect.objectContaining({ countryCode: 'UK' })
      );
    });
  });
});
