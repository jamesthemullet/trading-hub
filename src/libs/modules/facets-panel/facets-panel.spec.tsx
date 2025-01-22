import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchPreviewResponseBeta } from '@/libs/api';
import {
  useGetCategories,
  useGetFacetAttributeValues,
  usePreview,
} from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { mockMerchandisingRulesWithInfo } from '@/test/data/mock-merchandising-rules-with-info';
import { renderWithProviders } from '@/test/render-with-providers';

import { FacetsPanel } from './facets-panel';
import { FacetRowDisplayValue } from './facets-panel-reducer';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  usePreview: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

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

const mockDefaultOrderData = [
  { defaultOrder: 'Include only' },
  { defaultOrder: 'Exclude only' },
  { defaultOrder: 'Exclude only' },
  { defaultOrder: 'Include only' },
  { defaultOrder: 'Include only' },
];

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

const onSaveSpy = jest.fn();
const onCancelSpy = jest.fn();
const dispatchSpy = jest.fn();
const setDateTimeSpy = jest.fn();

const mockFacetsState: FacetRowDisplayValue[] = [
  {
    displayType: 'included',
    displayValue: 'color',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
    indexPropertyName: 'color',
    lastChanged: {
      date: '2021-01-01T08:34:15Z',
      user: 'Test User',
    },
    merged: [
      {
        displayValue: 'test merged group',
        mergedValues: ['merged 1', 'merged 2'],
      },
    ],
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: false,
    },
  },
  {
    displayType: 'included',
    displayValue: 'brand',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
    indexPropertyName: 'brand',
    lastChanged: {
      date: '2021-01-03T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: false,
      isEndOfDisplayTypeGroup: true,
    },
  },
  {
    displayType: 'algoControl',
    displayValue: 'size',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
    indexPropertyName: 'size',
    lastChanged: {
      date: '2021-01-02T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: false,
    },
  },
  {
    displayType: 'algoControl',
    displayValue: 'price',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
    indexPropertyName: 'price',
    lastChanged: {
      date: '2021-01-05T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: false,
      isEndOfDisplayTypeGroup: true,
    },
  },
  {
    displayType: 'excluded',
    displayValue: 'category',
    id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
    indexPropertyName: 'category',
    lastChanged: {
      date: '2021-01-04T08:34:15Z',
      user: 'Test User',
    },
    merged: [],
    meta: {
      isBeginningOfDisplayTypeGroup: true,
      isEndOfDisplayTypeGroup: true,
    },
  },
];

const mockIncludedFacets = [
  facetsListMock.facets[0],
  facetsListMock.facets[2],
  facetsListMock.facets[3],
];
const mockExcludedFacets = {
  facets: [{ id: facetsListMock.facets[1].id }],
};

describe('Facet Panel', () => {
  beforeEach(() => {
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
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should not render preview button or add new facets button, if global facets page', async () => {
    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="global"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Preview' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add new facet' })
    ).not.toBeInTheDocument();
  });

  it('should not enable preview button if no categories selected', async () => {
    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    expect(screen.queryByRole('button', { name: 'Preview' })).toBeDisabled();
  });

  it('should not enable preview button if no search terms added', async () => {
    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="search"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    expect(screen.queryByRole('button', { name: 'Preview' })).toBeDisabled();
  });

  it('should render column headings', () => {
    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should preview changes to a category facet', async () => {
    jest.mocked(usePreview).mockReturnValue(mockCategoryReturnValue);

    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK_IE"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        selectedCategories={[categoryId1]}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    const previewButton = screen.getByRole('button', { name: 'Preview' });

    act(() => {
      previewButton.click();
    });

    const previewText = await screen.findByText(
      'Search across the site to preview the rule influence'
    );

    expect(previewText).toBeInTheDocument();

    expect(usePreview).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: 'UK' })
    );

    const closeButton = screen.getByLabelText('close modal');

    act(() => {
      closeButton.click();
    });

    expect(
      screen.queryByText('Search across the site to preview the rule influence')
    ).not.toBeInTheDocument();
  });

  it('should preview changes to a search facet', async () => {
    jest.mocked(usePreview).mockReturnValue(mockCategoryReturnValue);

    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="search"
        countryCode="UK_IE"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetDataChange={jest.fn()}
        searchTerms={['red']}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    const previewButton = screen.getByRole('button', { name: 'Preview' });

    act(() => {
      previewButton.click();
    });

    const previewText = await screen.findByText(
      'Search across the site to preview the rule influence'
    );

    expect(previewText).toBeInTheDocument();

    expect(usePreview).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: 'UK' })
    );

    const closeButton = screen.getByLabelText('close modal');

    act(() => {
      closeButton.click();
    });

    expect(
      screen.queryByText('Search across the site to preview the rule influence')
    ).not.toBeInTheDocument();
  });

  it('should handle order change when button down is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        displayRowOrderControls={true}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    expect(dispatchSpy).toHaveBeenCalledWith({
      payload: { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
      type: 'MOVE_INCLUDED_ROW_DOWN',
    });
  });

  it('should handle order change when button up is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK_IE"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        displayRowOrderControls={true}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Move brand row up' }));

    expect(dispatchSpy).toHaveBeenCalledWith({
      payload: { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86' },
      type: 'MOVE_INCLUDED_ROW_UP',
    });
  });

  it('should highlight the row in the correct background colour depending on whether exclude/include only is selected', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        defaultOrderData={mockDefaultOrderData}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    const dropdown = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];

    await user.click(dropdown);
    const includeOnlyOption = screen.getAllByText('Include only')[0];

    await user.click(includeOnlyOption);

    expect(screen.getAllByTestId('facets-table-row')[0]).toHaveStyle(
      'background-color: #f4faed'
    );

    await user.click(dropdown);
    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith({
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
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        selectedCategories={[categoryId1]}
        setDateTime={jest.fn()}
        onFacetDataChange={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    expect(screen.getByPlaceholderText('Select date range')).toHaveValue('');
  });

  it('should show a previously saved scheduled date', async () => {
    renderWithProviders(
      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        countryCode="UK"
        selectedPreviewCountryCode="UK"
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        selectedCategories={[categoryId1]}
        onFacetDataChange={jest.fn()}
        startDate="2024-11-05T00:00:00.000Z"
        endDate="2024-11-06T00:00:00.000Z"
        setDateTime={jest.fn()}
        facetsState={mockFacetsState}
        includedFacets={mockIncludedFacets}
        excludedFacets={mockExcludedFacets}
        dispatch={dispatchSpy}
      />
    );

    expect(screen.getByPlaceholderText('Select date range')).toHaveValue(
      '05/11/24 00:00 - 06/11/24 00:00'
    );
  });

  describe('Edit Facet Values Modal', () => {
    it('should open the modal', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <FacetsPanel
          title="Facet Rule Editor"
          facetType="global"
          countryCode="UK"
          selectedPreviewCountryCode="UK"
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          setDateTime={setDateTimeSpy}
          facetsState={mockFacetsState}
          includedFacets={mockIncludedFacets}
          excludedFacets={mockExcludedFacets}
          dispatch={dispatchSpy}
        />
      );

      const editFacetValuesButton = (
        await screen.findAllByText('Edit values')
      )[0];

      expect(editFacetValuesButton).toBeVisible();

      user.click(editFacetValuesButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Facet value settings of: color',
          })
        ).toBeVisible();
      });
    });

    it('should close the modal on click of the close button', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <FacetsPanel
          title="Facet Rule Editor"
          facetType="global"
          countryCode="UK"
          selectedPreviewCountryCode="UK"
          onSave={onSaveSpy}
          onCancel={onCancelSpy}
          setDateTime={setDateTimeSpy}
          facetsState={mockFacetsState}
          includedFacets={mockIncludedFacets}
          excludedFacets={mockExcludedFacets}
          dispatch={dispatchSpy}
        />
      );

      const editFacetValuesButton = screen.getAllByText('Edit values')[0];

      act(() => {
        editFacetValuesButton.click();
      });

      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Facet value settings of: color',
        })
      ).toBeVisible();

      const closeButton = screen.getByLabelText('Close attributes modal');

      act(() => {
        user.click(closeButton);
      });

      await waitFor(async () => {
        expect(
          await screen.findByRole('heading', {
            level: 3,
            name: 'Facet value settings of: color',
          })
        ).not.toBeVisible();
      });
    });
  });
});
