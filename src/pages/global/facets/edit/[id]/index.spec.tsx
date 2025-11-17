import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import {
  useGetCategories,
  useGetFacetAttributeValues,
  useGlobalFacetsList,
  useGlobalRuleSetDetail,
  useRuleSet,
} from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  ...jest.requireActual('@/libs/hooks/use-get-facet-attribute-values'),
  useGetFacetAttributeValues: jest.fn(),
}));

const mockUpdateGlobalFacet = jest
  .fn()
  .mockResolvedValue({ displayValue: 'colour' });
const updateGlobalFacet = {
  handleGlobalFacetUpdate: mockUpdateGlobalFacet,
  error: '',
};

const mockUpdateGlobalRuleSet = jest.fn().mockReturnValue(true);

const saveGlobalRuleset = {
  saveGlobalRuleset: mockUpdateGlobalRuleSet,
  isSaving: true,
  error: '',
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGetCategories: jest.fn(),
  useRuleSet: jest.fn(),
  useGlobalFacetsList: jest.fn(),
  useGlobalRuleSetDetail: jest.fn(),
  useGlobalFacetUpdate: () => {
    return updateGlobalFacet;
  },
  useGlobalRuleSetUpdate: () => {
    return saveGlobalRuleset;
  },
}));

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
const mockMerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};

describe('Global Facet Management Editing', () => {
  const mockRouter = {
    push: jest.fn(),
    query: { id: '123' },
  };

  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      isLoading: false,
      facets: facetsListMock.facets,
      error: '',
      onRefreshFacetList: jest.fn(),
    });
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoriesInfo: [
          {
            id: `foo${i}`,
          },
        ],
        categoryIds: [`foo${i}`],
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: mockMerchandisingRules,
        setRuleSets: jest.fn(),
        facets: [],
      })),
      globalRuleSets: [],
      pagination: {
        totalItems: 80,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    jest.mocked(useGlobalRuleSetDetail).mockReturnValue({
      globalRuleSet: {
        id: '123',
        isEnabled: true,
        lastChanged: {
          date: '2021-01-01',
          user: 'Test user',
        },
        rules: mockMerchandisingRules,
        facets: [
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
          },
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87' },
        ],
        excludedFacets: {
          facets: [
            {
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
            },
          ],
        },
      },

      error: '',
      isLoading: false,
    });
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the facet management editing page', async () => {
    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Preview' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Global Facet Rule Editor',
      })
    ).toBeVisible();
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<Page id={ruleSetId} />, [], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(
      screen.getByText('please contact admin on our teams channel', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('should render column headings', () => {
    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
    expect(screen.getByText('Value options')).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/global');
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'Select country',
    });

    await user.click(dropdownButton);

    const selectUKIE = screen.getByRole('option', {
      name: 'UK market only',
    });

    await user.click(selectUKIE);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Apply global changes',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Apply action' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith({
      ruleSetId: '123',
      ruleSet: {
        facets: [
          {
            boosted: ['Cotton', 'Duck Down'],
            excludedValues: ['Ducky Downy'],
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
          },
          {
            boosted: undefined,
            excludedValues: undefined,
            displayValue: 'brand',
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
            indexPropertyName: 'brand',
            lastChanged: {
              date: '2021-01-03T08:34:15Z',
              user: 'Test User',
            },
            merged: [],
          },
          {
            boosted: undefined,
            excludedValues: undefined,
            displayValue: 'category',
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
            indexPropertyName: 'category',
            lastChanged: {
              date: '2021-01-04T08:34:15Z',
              user: 'Test User',
            },
            merged: [],
          },
        ],
        rules: mockMerchandisingRules,
        excludedFacets: {
          facets: [
            {
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
            },
          ],
        },
        isEnabled: true,
        countryCode: 'UK',
      },
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/global');
  });

  it('should close the confirmation modal when cancel button on modal clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Apply global changes',
        })
      ).toBeVisible();
    });

    await user.click(
      screen.getByRole('button', { name: 'Close confirmation modal' })
    );

    expect(mockUpdateGlobalRuleSet).not.toHaveBeenCalled();
  });

  it('should render skeleton when loading', () => {
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      isLoading: true,
      facets: [],
      error: '',
      onRefreshFacetList: jest.fn(),
    });

    renderWithProviders(<Page id={ruleSetId} />);

    expect(() => screen.getByRole('button', { name: 'Save' })).toThrow(
      'Unable to find an accessible element with the role "button"'
    );
  });

  it('should filter on the facet list', async () => {
    renderWithProviders(<Page id={ruleSetId} />);

    const search = screen.getByPlaceholderText('Search');

    await userEvent.type(search, 'color');

    await waitFor(() => {
      expect(screen.getAllByText('color')[0]).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getAllByText('color')[1]).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.queryAllByText('size').length).toBe(0);
    });
  });

  it('should edit a display value', async () => {
    renderWithProviders(<Page id={ruleSetId} />);

    const editButton = screen.getByLabelText('Edit display name for color');

    act(() => {
      editButton.click();
    });

    const editColorInput = await screen.findByLabelText(
      'Edit color input field'
    );

    await waitFor(async () => {
      expect(editColorInput).toBeVisible();
    });

    expect(editColorInput).toHaveValue('color');
    await userEvent.clear(editColorInput);
    await userEvent.type(editColorInput, 'colour');

    const saveButton = screen.getByLabelText('Save color change');

    act(() => {
      saveButton.click();
    });

    await waitFor(() => {
      expect(mockUpdateGlobalFacet).toHaveBeenCalledWith({
        data: {
          displayValue: 'colour',
          indexPropertyName: 'color',
          boosted: ['Cotton', 'Duck Down'],
          excludedValues: ['Ducky Downy'],
        },
        facetId: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
      });
    });
  });

  it('should show an error if failing to edit a display value', async () => {
    updateGlobalFacet.error = 'Failed to update facet';
    mockUpdateGlobalFacet.mockResolvedValue({ status: 'error' });
    renderWithProviders(<Page id={ruleSetId} />);

    const editButton = screen.getByLabelText('Edit display name for color');

    act(() => {
      editButton.click();
    });

    const editColorInput = await screen.findByLabelText(
      'Edit color input field'
    );

    await waitFor(async () => {
      expect(editColorInput).toBeVisible();
    });

    expect(editColorInput).toHaveValue('color');
    await userEvent.clear(editColorInput);
    await userEvent.type(editColorInput, 'colour');

    const saveButton = screen.getByLabelText('Save color change');

    act(() => {
      saveButton.click();
    });

    expect(
      await screen.findByText(
        'Error whilst updating global facet: Failed to update facet'
      )
    ).toBeVisible();
  });

  it('should update status on dropdown change to exclude only, and re-order by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();

    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as excluded')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing color as included')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing color as algoControl')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to include only, and re-order by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('Row showing size as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing size as included')
    ).not.toBeInTheDocument();

    await waitFor(async () => {
      const includeOnlyOption = screen.getAllByText('Include only')[6];

      await user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(screen.getByTestId('Row showing size as included')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing size as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing size as algoControl')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to include only from exclude only', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(screen.getByTestId('Row showing price as excluded')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing price as included')
    ).not.toBeInTheDocument();

    await waitFor(async () => {
      const includeOnlyOption = screen.getAllByText('Include only')[7];

      await user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(screen.getByTestId('Row showing price as included')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing price as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing price as algoControl')
    ).not.toBeInTheDocument();
  });

  it('should update status on dropdown change to algoControl only from include only', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing color as algoControl')
    ).not.toBeInTheDocument();

    await waitFor(async () => {
      const includeOnlyOption = screen.getAllByText('Algo control')[0];

      await user.click(includeOnlyOption);
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('Row showing color as algoControl')
      ).toBeVisible();
    });

    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing color as included')
    ).not.toBeInTheDocument();
  });

  it('should render correct with undefined excluded facets', async () => {
    const user = userEvent.setup();
    jest.mocked(useGlobalRuleSetDetail).mockReturnValue({
      globalRuleSet: {
        id: '123',
        isEnabled: true,
        lastChanged: {
          date: '2021-01-01',
          user: 'Test user',
        },
        rules: mockMerchandisingRules,
        facets: [
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
          },
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87' },
        ],
        excludedFacets: undefined,
      },

      error: '',
      isLoading: false,
    });

    renderWithProviders(<Page id={ruleSetId} />);

    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as included')).toBeVisible();
    });
    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();

    const excludeOnlyOption = screen.getAllByText('Exclude only')[0];

    await user.click(excludeOnlyOption);
    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as excluded')).toBeVisible();
    });
    expect(
      screen.queryByTestId('Row showing color as included')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('Row showing color as algoControl')
    ).not.toBeInTheDocument();
  });

  it('should not update status if the same status is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page id={ruleSetId} />);

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();

    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();

    const includeOnlyOption = screen.getAllByText('Include only')[1];

    await user.click(includeOnlyOption);

    expect(screen.getByTestId('Row showing color as included')).toBeVisible();

    expect(
      screen.queryByTestId('Row showing color as excluded')
    ).not.toBeInTheDocument();
  });

  it('loads the mock data', async () => {
    const mockPageId = 'abc123';
    const context = { query: { id: mockPageId } as ParsedUrlQuery };
    const result = await getServerSideProps(
      context as GetServerSidePropsContext
    );

    if (!('props' in result) || !result.props) {
      throw new Error('No props returned');
    }

    expect((await result.props).id).toBe(mockPageId);
  });

  describe('Error display', () => {
    it('should display an error if the facet list fails to load, and also not show the facet list', async () => {
      jest.mocked(useGlobalFacetsList).mockReturnValue({
        isLoading: false,
        facets: [],
        error: 'Failed to load facets',
        onRefreshFacetList: jest.fn(),
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        await screen.findByText(
          'Error whilst retrieving global facet list: Failed to load facets'
        )
      ).toBeVisible();

      expect(screen.queryByText('color')).not.toBeInTheDocument();
    });

    it('should display an error if the rule set fails to load', async () => {
      jest.mocked(useGlobalRuleSetDetail).mockReturnValue({
        globalRuleSet: {
          id: '123',
          isEnabled: true,
          lastChanged: {
            date: '2021-01-01',
            user: 'Test user',
          },
          rules: mockMerchandisingRules,
          facets: [
            { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
            {
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
            },
            { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87' },
          ],
        },
        error: 'Failed to load rule set',
        isLoading: false,
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        await screen.findByText(
          'Error whilst retrieving global ruleset: Failed to load rule set'
        )
      ).toBeVisible();
    });

    it('should display an error if the rule set fails to update', async () => {
      saveGlobalRuleset.error = 'Failed to update rule set';

      renderWithProviders(<Page id={ruleSetId} />);

      expect(screen.getByTestId('Row showing color as included')).toBeVisible();

      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(async () => {
        expect(
          await screen.findByText(
            'Error whilst saving global ruleset: Failed to update rule set'
          )
        ).toBeVisible();
      });
    });
  });
});
