import { act, Screen, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { useGetCategories, useGetFacetAttributeValues } from '@/libs/hooks';
import {
  attributeValuesMock,
  globalFacetsListMock,
} from '@/pages/api/merchandising/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import { FacetsPanel } from './facets-panel';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

const CATEGORY_SEARCH_PLACEHOLDER_TEXT = 'Search...';
const categoryId1 = 'cat_123';
const categoryName1 = 'jeans';
const categoryPath1 = 'l/jeans';
const mockGetCategories = {
  categories: [
    {
      identifier: categoryId1,
      name: categoryName1,
      path: categoryPath1,
    },
  ],
  pagination: { totalItems: 20 },
};
const mockFacet = {
  displayValue: 'color',
  id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
  indexPropertyName: 'color',
  lastChanged: { date: '2021-01-01T08:34:15Z', user: 'Test User' },
  merged: [],
  status: 'included',
};

const mockMerchandisingRules = {
  pinnedProducts: [{ id: 'productId' }],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  blockedProducts: [],
};

const mockDefaultOrderData = [
  { defaultOrder: 'Include only' },
  { defaultOrder: 'Exclude only' },
  { defaultOrder: 'Exclude only' },
  { defaultOrder: 'Include only' },
  { defaultOrder: 'Include only' },
];

const selectCategory = async (screen: Screen, user: UserEvent) => {
  await user.type(
    screen.getByPlaceholderText(CATEGORY_SEARCH_PLACEHOLDER_TEXT),
    'SubCategory_507{enter}'
  );

  const categoryToSelect = await screen.findByText(
    `${categoryId1} | ${categoryName1} | ${categoryPath1}`
  );

  act(() => {
    categoryToSelect.click();
  });
};

const onSaveSpy = jest.fn();
const onCancelSpy = jest.fn();
const setSearchSpy = jest.fn();
const onFacetDataChangeSpy = jest.fn();
const onHandleStatusChangeSpy = jest.fn();

describe('Facet Panel', () => {
  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock['values'],
      error: '',
      pagination: {
        totalItems: 5,
      },
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
        facetType="category"
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should not render preview button or add facets button, if global facets page', async () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
        facetType="global"
      />
    );

    expect(screen.queryByRole('button', { name: 'Preview' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add facet' })).toBeNull();
  });

  it('should render column headings', () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
        facetType="category"
      />
    );

    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={[]}
        onFacetDataChange={jest.fn()}
        facetType="category"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(onCancelSpy).toHaveBeenCalled();
  });

  it('should preview changes to a facet', async () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
        defaultCategory={{ identifier: categoryId1, name: categoryName1 }}
        facetType="category"
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
    const onFacetsDataRowOrderChangeSpy = jest.fn();

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetsDataRowOrderChange={onFacetsDataRowOrderChangeSpy}
        displayRowOrderControls={true}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
        facetType="category"
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Move color row down' })
    );

    expect(onFacetsDataRowOrderChangeSpy).toHaveBeenCalledWith(0, 1);
  });

  it('should handle order change when button up is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onFacetsDataRowOrderChangeSpy = jest.fn();

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        onFacetsDataRowOrderChange={onFacetsDataRowOrderChangeSpy}
        displayRowOrderControls={true}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
        facetType="category"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Move size row up' }));

    expect(onFacetsDataRowOrderChangeSpy).toHaveBeenCalledWith(1, -1);
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
        defaultCategory={{ identifier: categoryId1, name: categoryName1 }}
        rulesetMerchandisingRules={mockMerchandisingRules}
        facetType="category"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSaveSpy).toHaveBeenCalled();
  });

  it('should select a category on user input, and clear category when "remove selected category" button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={jest.fn()}
        facetType="category"
      />
    );

    await selectCategory(screen, user);

    expect(screen.getByText('cat_123')).toBeVisible();

    const clearButton = screen.getByLabelText('Remove selected category');

    act(() => {
      clearButton.click();
    });

    expect(screen.queryByText('cat_123')).not.toBeInTheDocument();
  });

  it('should highlight the row in the correct background colour depending on whether exclude/include only is selected', async () => {
    const user = userEvent.setup({ delay: null });
    const includedFacetsMock = [
      { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
      { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86' },
      { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87' },
    ];

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        defaultOrderData={mockDefaultOrderData}
        onHandleStatusChange={onHandleStatusChangeSpy}
        includedFacets={includedFacetsMock}
        facetType="category"
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
      expect(onHandleStatusChangeSpy).toHaveBeenCalledWith(
        'excluded',
        'b04eaac3-f4ea-4f21-9459-0b4302dc2a84'
      );
    });
  });

  it('should filter on the facet list', async () => {
    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        setSearch={setSearchSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        defaultCategory={{ identifier: categoryId1, name: categoryName1 }}
        onFacetDataChange={jest.fn()}
        facetType="category"
      />
    );

    const search = screen.getByPlaceholderText('Search...');

    await act(() => userEvent.type(search, 'color'));

    await waitFor(() => expect(setSearchSpy).toHaveBeenCalledWith('color'));
  });

  it('should edit a display value if canEditDisplayName field passed', async () => {
    const onSaveSpy = jest.fn();
    const onCancelSpy = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FacetsPanel
        onSave={onSaveSpy}
        onCancel={onCancelSpy}
        title="Facet Rule Editor"
        facetsData={globalFacetsListMock.facets}
        onFacetDataChange={onFacetDataChangeSpy}
        canEditDisplayName={true}
        facetType="category"
      />
    );

    const editButton = screen.getByLabelText('Edit display name for color');

    await user.click(editButton);

    await waitFor(async () => {
      const editColorInput = screen.getByLabelText('Edit color input field');
      expect(editColorInput).toBeVisible();
      expect(editColorInput).toHaveValue('color');
      userEvent.clear(editColorInput);
      await userEvent.type(editColorInput, 'colour');
    });

    const saveButton = screen.getByLabelText('Save color change');

    await user.click(saveButton);

    expect(onFacetDataChangeSpy).toHaveBeenCalledWith(0, 'colour', {
      ...mockFacet,
      merged: [
        {
          displayValue: 'test merged group',
          mergedValues: ['merged 1', 'merged 2'],
        },
      ],
    });
  });
});
