import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetCategories, useGetFacetAttributeValues } from '@/libs/hooks';
import * as analytics from '@/libs/hooks/utils/analytics';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import type { Props } from './facet-list';
import { Facets } from './facet-list';

const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetFacetAttributeValues: jest.fn(),
  useFacetsList: () => {
    return mockUseFacetsList;
  },
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));

jest.mock('@/libs/hooks/utils/analytics', () => {
  return {
    track: jest.fn(),
  };
});

const analyticsSpy = jest.spyOn(analytics, 'track');

const categoryId1 = 'cat_123';
const categoryId2 = 'IE_cat123';
const categoryId3 = 'cat456';
const categoryName1 = 'jeans';
const categoryPath1 = 'l/jeans';
const categoryName3 = 'jeggings';
const categoryPath3 = 'l/jeggings';
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
    {
      identifier: categoryId3,
      name: categoryName3,
      path: categoryPath3,
    },
  ],
  pagination: { totalItems: 20 },
};

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

const defaultFacetProps: Props = {
  facetType: 'category',
  isNewRuleset: true,
  onCancel: () => jest.fn(),
  onSave: () => jest.fn(),
  writeEnabled: true,
};

describe('Facets', () => {
  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<Facets {...defaultFacetProps} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Facet Rule Editor' })
    ).toBeVisible();
  });

  it('should add and set a category', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Facets {...defaultFacetProps} />);
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'je');

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );

    act(() => {
      categoryToSelect.click();
    });

    act(() => {
      screen.getByRole('button', { name: 'Close' }).click();
    });

    expect(
      screen.getByRole('button', { name: 'select category' })
    ).toHaveTextContent(categoryId1);
  });

  it('should clear a set category', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: `Remove category from modal: ${categoryId1}`,
      });

      act(() => {
        button.click();
      });
    });

    expect(screen.getByPlaceholderText('Search...')).toBeVisible();
  });

  it('should not allow setting a duplicate category', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Facets {...defaultFacetProps} />);
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'je');

    const categoryToSelect = await screen.findByText(
      `${categoryId2} | ${categoryName1} | ${categoryPath1}`
    );

    act(() => {
      categoryToSelect.click();
    });

    await user.type(searchInput, 'jeans');

    const modalCategoryToSelect = await screen.findByText(
      `${categoryId2} | ${categoryName1} | ${categoryPath1}`
    );

    act(() => {
      modalCategoryToSelect.click();
    });

    expect(
      screen.getByText(`Ruleset ${categoryId2} has already been added`)
    ).toBeVisible();
  });

  it('should add and set a search term', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Facets {...defaultFacetProps} facetType="search" />);

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const searchInput = screen.getByLabelText('Add keyword to list');
    await user.type(searchInput, 'jeans{Enter}');

    expect(screen.getByLabelText('Remove keyword: jeans')).toBeVisible();
  });

  it('should not allow setting a duplicate search term', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Facets {...defaultFacetProps} facetType="search" />);

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });
    const searchInput = screen.getByLabelText('Add keyword to list');
    await user.type(searchInput, 'jeans{Enter}');
    await user.type(searchInput, 'jeans{Enter}');

    expect(
      screen.getByText('Keyword jeans has already been added')
    ).toBeVisible();
  });

  it('should remove an existing search term', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        facetType="search"
        searchTerms={['jeans']}
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });
    await waitFor(() => {
      const jeansButton = screen.getByLabelText('Remove keyword: jeans');

      act(() => {
        jeansButton.click();
      });

      expect(jeansButton).not.toBeInTheDocument();
    });
  });

  it('should filter facets', async () => {
    const user = userEvent.setup({ delay: null });
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{
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
        }}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(
      screen.getByTestId('Row showing brand as algoControl')
    ).toBeVisible();
    expect(screen.getByTestId('Row showing size as algoControl')).toBeVisible();

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, `size{Enter}`);

    const resultCount = await screen.findByText('1 result');
    expect(resultCount).toBeVisible();

    expect(
      screen.queryByTestId('Row showing brand as algoControl')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('Row showing size as algoControl')).toBeVisible();
  });

  it('should change a facet display type', async () => {
    const user = userEvent.setup({ delay: null });
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(
      screen.getByTestId('Row showing color as algoControl')
    ).toBeVisible();

    const dropdownHeader = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];
    await user.click(dropdownHeader);

    const alwaysHideOption = screen.getAllByText('Exclude only')[0];
    await user.click(alwaysHideOption);

    expect(screen.getByTestId('Row showing color as excluded')).toBeVisible();
  });

  it('should not change a facet display type when clicking on the existing value', async () => {
    const user = userEvent.setup({ delay: null });
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(
      screen.getByTestId('Row showing color as algoControl')
    ).toBeVisible();

    const dropdownHeader = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];
    await user.click(dropdownHeader);

    const alwaysHideOption = screen.getAllByText('Algo control')[1];
    await user.click(alwaysHideOption);

    expect(
      screen.getByTestId('Row showing color as algoControl')
    ).toBeVisible();
  });

  it('should reorder an included facet', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            { id: facetsListMock.facets[0].id },
            { id: facetsListMock.facets[1].id },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();

    const downButton = screen.getByLabelText('Move color row down');

    expect(screen.getByLabelText('Move color row up')).toBeDisabled();

    act(() => {
      downButton.click();
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Move color row down')).toBeDisabled();
    });
    const upButton = screen.getByLabelText('Move color row up');
    act(() => {
      upButton.click();
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Move color row down')).toBeEnabled();
    });
  });

  it('should show and close the preview modal for categories', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            { id: facetsListMock.facets[0].id },
            { id: facetsListMock.facets[1].id },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    await waitFor(() => {
      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });
    });

    expect(
      screen.getByText('View rule changes made on the website below')
    ).toBeVisible();

    const closeButton = screen.getByLabelText('close modal');

    act(() => {
      closeButton.click();
    });
    expect(
      screen.queryByText('View rule changes made on the website below')
    ).not.toBeInTheDocument();
  });

  it('should track the opening of the preview modal for categories', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            { id: facetsListMock.facets[0].id },
            { id: facetsListMock.facets[1].id },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    await waitFor(() => {
      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });
    });

    expect(analyticsSpy).toHaveBeenCalledWith({
      event: 'Preview category facets - cat_123',
    });
  });

  it('should show and close the preview modal for search terms', async () => {
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, facets: undefined }}
        isNewRuleset={false}
        facetType="search"
        searchTerms={['socks']}
      />
    );

    await waitFor(() => {
      const previewButton = screen.getByRole('button', { name: 'Preview' });

      act(() => {
        previewButton.click();
      });
    });

    expect(
      screen.getByText('View rule changes made on the website below')
    ).toBeVisible();

    const closeButton = screen.getByLabelText('close modal');

    act(() => {
      closeButton.click();
    });
    expect(
      screen.queryByText('View rule changes made on the website below')
    ).not.toBeInTheDocument();
  });

  it('should set the preview country for search facets to IE', async () => {
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, countryCode: 'UK_IE' }}
        isNewRuleset={false}
        facetType="search"
        searchTerms={['socks']}
      />
    );

    expect(screen.getAllByText('IE view')).toHaveLength(1);
    const selectPreview = screen.getByRole('button', {
      name: 'Select country for preview',
    });

    act(() => {
      selectPreview.click();
    });

    const selectIE = screen.getByRole('button', {
      name: 'IE flag IE view',
    });
    act(() => {
      selectIE.click();
    });

    expect(screen.getAllByText('IE view')).toHaveLength(2);
  });

  it('should set the preview country for search facets to UK', async () => {
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, countryCode: 'UK_IE' }}
        isNewRuleset={false}
        facetType="search"
        searchTerms={['socks']}
      />
    );

    const selectPreview = screen.getByRole('button', {
      name: 'Select country for preview',
    });

    act(() => {
      selectPreview.click();
    });

    const selectUK = screen.getByRole('button', {
      name: 'UK flag UK view',
    });
    act(() => {
      selectUK.click();
    });

    expect(screen.getAllByText('UK view')).toHaveLength(2);
  });

  it('should open and close the preview country dropdown', async () => {
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, countryCode: 'UK_IE' }}
        isNewRuleset={false}
        facetType="search"
        searchTerms={['socks']}
      />
    );

    const selectPreview = screen.getByRole('button', {
      name: 'Select country for preview',
    });

    act(() => {
      selectPreview.click();
    });

    expect(
      screen.getByRole('button', { name: 'UK flag UK view' })
    ).toBeVisible();

    act(() => {
      selectPreview.click();
    });

    expect(
      screen.queryByRole('button', { name: 'UK flag UK view' })
    ).not.toBeInTheDocument();
  });

  it('should change the country of influence', async () => {
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{ ...mockRuleset, countryCode: 'UK_IE' }}
        isNewRuleset={false}
        facetType="search"
        searchTerms={['socks']}
      />
    );

    expect(screen.getAllByText('IE view')).toHaveLength(1);
    const selectMarket = screen.getByRole('button', {
      name: 'Select country',
    });

    act(() => {
      selectMarket.click();
    });

    const selectIE = screen.getByRole('option', {
      name: 'IE market only',
    });
    act(() => {
      selectIE.click();
    });

    expect(screen.getAllByText('IE market only')).toHaveLength(2);
  });

  describe('scheduling', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2022, 2, 1));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should change the duration', async () => {
      renderWithProviders(
        <Facets
          {...defaultFacetProps}
          currentRuleset={{
            ...mockRuleset,
            countryCode: 'UK_IE',
            endDate: '2022-04-13T22:59:00.000Z',
            startDate: '2022-04-11T23:00:00.000Z',
          }}
          isNewRuleset={false}
          facetType="search"
          searchTerms={['socks']}
        />
      );
      expect(screen.getByText('Duration')).toBeVisible();

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        expect(screen.getByText('On all the time')).toBeVisible();
      });

      await waitFor(() => {
        const startDate = screen.getAllByText('16')[1];
        act(() => {
          startDate.click();
        });
      });

      await waitFor(() => {
        const endDate = screen.getAllByText('17')[1];
        act(() => {
          endDate.click();
        });
      });

      const saveButton = within(
        screen.getByLabelText('Datepicker modal')
      ).getByRole('button', { name: 'Close schedule editor' });
      expect(saveButton).toBeEnabled();
      act(() => {
        saveButton.click();
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Select date range')).toHaveValue(
          '16/04/22 23:00 - 17/04/22 22:59'
        );
      });
    });
  });

  it('should open and close the facet values modal', async () => {
    const categoriesInfo = [
      {
        id: categoryId1,
        name: categoryName1,
        plpUrl: categoryPath1,
      },
    ];
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        isNewRuleset={false}
        categoriesInfo={categoriesInfo}
      />
    );

    const editValuesButton = screen.getByRole('button', {
      name: 'Edit values',
    });

    act(() => {
      editValuesButton.click();
    });

    expect(screen.getByText('Facet value settings of: color')).toBeVisible();

    const cancelButton = within(
      screen.getByLabelText('Edit facet values modal')
    ).getByRole('button', { name: 'Close attributes modal' });

    act(() => {
      cancelButton.click();
    });

    expect(
      screen.queryByText('Facet value settings of: color')
    ).not.toBeInTheDocument();
  });

  it('should open and return changes from the facet values modal', async () => {
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        isNewRuleset={false}
        facetType="search"
        searchTerms={['socks']}
      />
    );

    const editValuesButton = screen.getByRole('button', {
      name: 'Edit values',
    });

    act(() => {
      editValuesButton.click();
    });

    expect(screen.getByText('Facet value settings of: color')).toBeVisible();

    const doneButton = within(
      screen.getByLabelText('Edit facet values modal')
    ).getByRole('button', { name: 'Save changes to attributes' });

    act(() => {
      doneButton.click();
    });

    expect(
      screen.queryByText('Facet value settings of: color')
    ).not.toBeInTheDocument();
  });

  it('should not allow to edit values of an algoControl facet', async () => {
    renderWithProviders(
      <Facets
        {...defaultFacetProps}
        currentRuleset={{
          ...mockRuleset,
          facets: [
            {
              id: facetsListMock.facets[0].id,
              boosted: [],
              excludedValues: [],
            },
          ],
        }}
        isNewRuleset={false}
        facetType="search"
        searchTerms={['socks']}
      />
    );

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();

    // Change existing included facet to algoControl - so there should be no edit values button
    const dropdownHeader = screen.getAllByTestId(
      'button to open facet order dropdown'
    )[0];
    await userEvent.click(dropdownHeader);

    const algoControlOption = screen.getByRole('option', {
      name: 'Algo control',
    });
    await userEvent.click(algoControlOption);

    const editValuesButtons = screen.queryAllByRole('button', {
      name: 'Edit values',
    });

    expect(editValuesButtons).toHaveLength(0);
  });

  it('should save facets changes', async () => {
    const onSaveSpy = jest.fn();
    const expectedCall = {
      categoryIds: ['cat_123'],
      countryCode: 'UK_IE',
      endDate: undefined,
      excludedFacets: { facets: [] },
      facets: [],
      isEnabled: true,
      rules: {
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        excludes: { alphanumeric: [] },
        includes: { alphanumeric: [] },
        pinnedProducts: [],
      },
      searchTerms: [],
      startDate: undefined,
    };

    renderWithProviders(<Facets {...defaultFacetProps} onSave={onSaveSpy} />);
    const user = userEvent.setup({ delay: null });
    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'je');

    const categoryToSelect = await screen.findByText(
      `${categoryId1} | ${categoryName1} | ${categoryPath1}`
    );

    act(() => {
      categoryToSelect.click();
    });

    const saveButton = await screen.findByRole('button', { name: 'Create' });

    act(() => {
      saveButton.click();
    });

    expect(onSaveSpy).toHaveBeenCalledWith(expectedCall);
  });
});
