import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import {
  useGetCategories,
  useGetFacetAttributeValues,
  useGlobalFacetsList,
  useGlobalRuleSetDetail,
  useRuleSet,
} from '@/libs/hooks';
import { useGlobalHistory } from '@/libs/hooks/global/history/use-global-history';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';
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

const mockUpdateGlobalRuleSet = jest
  .fn()
  .mockResolvedValue({ status: 'success' });

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

jest.mock('@/libs/hooks/global/history/use-global-history', () => ({
  useGlobalHistory: jest.fn(() => ({
    history: { changes: [], pagination: { totalItems: 0 } },
    isLoading: false,
    error: '',
  })),
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

describe('Global Facet Management Editing', () => {
  const mockRouter = {
    push: jest.fn(),
    reload: jest.fn(),
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

    expect(screen.getByText('Ranking')).toBeVisible();
    expect(screen.getByText('Attribute')).toBeVisible();
    expect(screen.getByText('Display name')).toBeVisible();
    expect(screen.getByText('Order')).toBeVisible();
  });

  it('should cancel changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getAllByText('Exclude only')[0]);
    await waitFor(() => {
      expect(screen.getByTestId('Row showing color as excluded')).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/global?catalogue=CLOTHING_AND_HOME'
    );
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    const dropdownButton = screen.getByRole('button', {
      name: /^Select country/i,
    });

    await user.click(dropdownButton);

    const selectUKIE = screen.getByRole('menuitemradio', {
      name: 'UK market only',
    });

    await user.click(selectUKIE);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Review changes',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith({
      ruleSetId,
      ruleSet: {
        facets: [
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86' },
          { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87' },
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
      catalogue: 'CLOTHING_AND_HOME',
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/global?catalogue=CLOTHING_AND_HOME'
    );
  });

  it('saves against the CFTO catalogue when navigated to with a CFTO catalogue query param', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      query: { ...mockRouter.query, catalogue: 'CFTO' },
    });
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Review changes',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ catalogue: 'CFTO' })
    );
    expect(mockRouter.push).toHaveBeenCalledWith('/global?catalogue=CFTO');
  });

  it('sends the v1 flag + version and shows the conflict modal on a 409', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockReturnValue({
      globalRuleSet: {
        id: '123',
        isEnabled: true,
        version: 3,
        lastChanged: { date: '2021-01-01', user: 'Test user' },
        rules: mockMerchandisingRules,
        facets: [{ id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' }],
        excludedFacets: { facets: [] },
      },
      error: '',
      isLoading: false,
    });
    mockUpdateGlobalRuleSet.mockResolvedValueOnce({
      status: 'conflict',
      currentEntity: {
        id: '123',
        version: 7,
        rules: mockMerchandisingRules,
        facets: [],
        lastChanged: { date: '2024-02-02T00:00:00Z', user: 'Other User' },
      },
    });

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(
      await screen.findByRole('button', { name: 'Save changes' })
    );

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ version: 3 })
    );
    expect(
      await screen.findByRole('dialog', {
        name: 'This global ruleset was changed by someone else',
      })
    ).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should close the confirmation modal when cancel button on modal clicked', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page id={ruleSetId} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Review changes',
        })
      ).toBeVisible();
    });

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(mockUpdateGlobalRuleSet).not.toHaveBeenCalled();
  });

  it('should render skeleton when loading', () => {
    jest.mocked(useGlobalRuleSetDetail).mockReturnValue({
      globalRuleSet: {
        id: '123',
        isEnabled: true,
        lastChanged: {
          date: '2021-01-01',
          user: 'Test user',
        },
        rules: mockMerchandisingRules,
        facets: [],
        excludedFacets: { facets: [] },
      },
      error: '',
      isLoading: true,
    });

    renderWithProviders(<Page id={ruleSetId} />);

    expect(() => screen.getByRole('button', { name: 'Save' })).toThrow(
      'Unable to find an accessible element with the role "button"'
    );
  });

  it('should render without a current ruleset when viewing a history entry that cannot be found', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      query: { history: 'true', historyId: 'non-existent-history-id' },
    });
    jest.mocked(useGlobalHistory).mockReturnValue({
      history: { changes: [], pagination: { totalItems: 0 } },
      isLoading: false,
      error: '',
    });

    renderWithProviders(<Page id={ruleSetId} />);

    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeVisible();
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

      await userEvent.click(
        await screen.findByRole('button', { name: 'Save changes' })
      );

      await waitFor(async () => {
        expect(
          await screen.findByText(
            'Error whilst saving global ruleset: Failed to update rule set'
          )
        ).toBeVisible();
      });
    });
  });

  describe('History view', () => {
    const mockGlobalRuleSet = {
      id: '123',
      isEnabled: true,
      lastChanged: {
        date: '2021-01-01',
        user: 'Test user',
      },
      rules: mockMerchandisingRules,
      facets: [
        { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84' },
        { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86' },
        { id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87' },
      ],
      excludedFacets: {
        facets: [{ id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88' }],
      },
    };

    const mockHistoryChange = {
      id: 'history-change-id',
      entityId: 'entity-id',
      savedAt: '2024-01-01T00:00:00Z',
      savedBy: 'test-user',
      schemaVersion: '1',
      change: {
        ...mockGlobalRuleSet,
        id: 'historical-ruleset-id',
      },
    };

    beforeEach(() => {
      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [], pagination: { totalItems: 0 } },
        isLoading: false,
        error: '',
      });
    });

    it('should render facets from history when history query param is true', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: {
          changes: [mockHistoryChange],
          pagination: { totalItems: 1 },
        },
        isLoading: false,
        error: '',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        await screen.findByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('should disable write access when viewing history', async () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: {
          changes: [mockHistoryChange],
          pagination: { totalItems: 1 },
        },
        isLoading: false,
        error: '',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        await screen.findByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
    });

    it('should show loader when history is loading', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [], pagination: { totalItems: 0 } },
        isLoading: true,
        error: '',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
    });

    it('should show history error when present', () => {
      (useRouter as jest.Mock).mockReturnValue({
        ...mockRouter,
        query: { history: 'true', historyId: 'history-change-id' },
      });

      jest.mocked(useGlobalHistory).mockReturnValue({
        history: { changes: [], pagination: { totalItems: 0 } },
        isLoading: false,
        error: 'Failed to load history',
      });

      renderWithProviders(<Page id={ruleSetId} />);

      expect(
        screen.getByText(
          'Error whilst retrieving history: Failed to load history'
        )
      ).toBeInTheDocument();
    });
  });
});
