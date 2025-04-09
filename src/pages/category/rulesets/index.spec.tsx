import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { MerchandisingReturnedCategoryRuleSet } from '@/libs/api';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

const mockNewRuleset = 'foo123';

const mockRuleSetDelete = jest.fn();
const mockUpdateRuleSet = jest.fn();
const mockRefetchRuleSetList = jest.fn();
const useRuleSetCreate = jest.fn();
const useRuleSet = jest.fn();

const createRuleset = jest.fn().mockResolvedValue({ id: mockNewRuleset });

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const server = setupServer(
  http.get('/api/search/beta/merchandising/category/ruleset', (ctx) => {
    const url = new URL(ctx.request.url);
    const countryCode = url.searchParams.get('countryCode');
    const data = useRuleSet(
      url.searchParams.get('q'),
      Number(url.searchParams.get('start')),
      Number(url.searchParams.get('rows')),
      'category'
    );
    if (data.error !== '') {
      return HttpResponse.json(
        {
          message: data.error,
          status: 500,
        },
        { status: 500 }
      );
    }
    mockRefetchRuleSetList({
      countryCode,
    });
    return HttpResponse.json(
      {
        ruleSets: data.categoryRuleSets,
        pagination: data.pagination,
      },
      { status: 200 }
    );
  }),
  http.delete('/api/search/beta/merchandising/category/ruleset/:id', (ctx) => {
    mockRuleSetDelete({ rulesetId: ctx.params.id });
    return HttpResponse.json({ id: ctx.params.id }, { status: 200 });
  }),
  http.get('/api/search/beta/merchandising/category/ruleset/:id', (ctx) => {
    const data = useRuleSet();
    const ruleSetReturned = data.categoryRuleSets.find(
      (ruleSet: any) => ruleSet.id === ctx.params.id
    );
    return HttpResponse.json(ruleSetReturned, { status: 200 });
  }),
  http.put(
    '/api/search/beta/merchandising/category/ruleset/:id',
    async (ctx) => {
      const data = useRuleSet();
      const ruleSetReturned = data.categoryRuleSets.find(
        (ruleSet: any) => ruleSet.id === ctx.params.id
      );
      const ruleSet = (await ctx.request.json()) as object;
      mockUpdateRuleSet({ ...ruleSet, ruleSetId: ctx.params.id });
      return HttpResponse.json(
        { ...ruleSetReturned, ...ruleSet },
        { status: 200 }
      );
    }
  ),
  http.post('/api/search/beta/merchandising/category/ruleset', async (ctx) => {
    const ruleSet = (await ctx.request.json()) as object;
    createRuleset(ruleSet);
    return HttpResponse.json(
      {
        id: mockNewRuleset,
        categoriesInfo: [
          {
            id: mockNewRuleset,
          },
        ],
        ...ruleSet,
      },
      { status: 200 }
    );
  })
);

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

const mockPush = jest.fn();
const mockRouter = {
  pathname: '/category/rulesets',
  query: {
    currentPage: '1',
    currentPageSize: '10',
    searchQuery: '',
  },
  isReady: true,
  push: mockPush,
};

describe('Index', () => {
  beforeAll(() => {
    server.listen();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset,
      error: '',
    });
  });

  beforeEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
    jest.resetAllMocks();
  });

  it('displays the list of rules', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    renderWithProviders(<RuleSets />);

    await waitFor(() => {
      expect(screen.getByText('Category ranking rules')).toBeVisible();
    });
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<RuleSets />, [], {
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

  it('should redirect to new page when add new rule is clicked', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      globalRuleSets: [],
      error: '',
      isLoading: false,
    });

    renderWithProviders(<RuleSets />);

    const createButton = await screen.findByText('Add new rule');
    act(() => {
      createButton.click();
    });

    expect(mockPush).toHaveBeenCalledWith('/category/rulesets/new');
  });

  it('displays schedule if a ruleset has a start and end date', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          id: '1',
          categoriesInfo: [
            {
              id: '1',
            },
          ],
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
        },
        {
          id: '2',
          categoriesInfo: [
            {
              id: '2',
            },
          ],
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-15T10:02:38.556Z',
          rules: mockMerchandisingRules,
          facets: [],
        },
      ],
      globalRuleSets: [],
      pagination: {
        totalItems: 2,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    renderWithProviders(<RuleSets />);

    expect(await screen.findByRole('time')).toHaveTextContent(
      '14 Oct 2024 - 15 Oct 2024'
    );
  });

  it('should search', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      globalRuleSets: [],
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<RuleSets />);

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

    await user.type(search, 'search-search');

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/category/rulesets',
        query: {
          searchQuery: 'search-search',
          currentPage: 1,
          currentPageSize: 10,
        },
      })
    );
  });

  it('should delete a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          id: mockId,
          categoriesInfo: [
            {
              id: 'catId',
            },
          ],
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
        },
      ],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    const user = userEvent.setup();
    renderWithProviders(<RuleSets />);

    const rulesetDropdown = await screen.findAllByTitle('More options');

    await user.click(rulesetDropdown[0]);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).not.toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
  });

  it('should enable or disable a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockCatId = 'catId';
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          countryCode: 'UK',
          id: mockId,
          categoriesInfo: [
            {
              id: mockCatId,
            },
          ],
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
          excludedFacets: {},
        },
        {
          id: 'ewfw-e3f23-f23f2-3cwef4',
          categoriesInfo: [
            {
              id: 'catId2',
            },
          ],
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
        },
      ],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<RuleSets />);

    const rulesetToggle = await screen.findAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      categoryIds: [mockCatId],
      countryCode: 'UK',
      ruleSetId: mockId,
      facets: [],
      excludedFacets: {},
      isEnabled: false,
      rules: mockMerchandisingRules,
    });
  });

  it('should enable or disable a scheduled ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockCatId = 'catId';
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          id: mockId,
          categoriesInfo: [
            {
              id: mockCatId,
            },
          ],
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-15T10:02:38.556Z',
        },
        {
          id: 'ewfw-e3f23-f23f2-3cwef4',
          categoriesInfo: [
            {
              id: 'catId2',
            },
          ],
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
        },
      ],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<RuleSets />);

    const rulesetToggle = await screen.findAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      categoryIds: [mockCatId],
      ruleSetId: mockId,
      rules: mockMerchandisingRules,
      facets: [],
      isEnabled: false,
      startDate: '2024-10-14T10:02:38.556Z',
      endDate: '2024-10-15T10:02:38.556Z',
    });
  });

  it('should duplicate a ruleset', async () => {
    const user = userEvent.setup();
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockRuleset: MerchandisingReturnedCategoryRuleSet = {
      id: mockId,
      countryCode: 'UK',
      categoriesInfo: [
        {
          id: 'foo00',
        },
      ],
      isEnabled: true,
      lastChanged: {
        user: 'user',
        date: '2021-01-01',
      },
      rules: mockMerchandisingRules,
      excludedFacets: { facets: [] },
      startDate: '2024-09-12T14:17:54Z',
      endDate: '2024-12-19T04:20:03Z',
    };
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [mockRuleset],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      globalRuleSets: [],
      error: '',
      isLoading: false,
    });

    renderWithProviders(<RuleSets />);

    await user.click((await screen.findAllByTitle('More options'))[0]);
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Create a duplicate rule' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Confirm',
    });
    await user.click(confirmButton);
    expect(createRuleset).toHaveBeenCalledWith({
      rules: mockRuleset.rules,
      facets: [],
      excludedFacets: { facets: [] },
      categoryIds: ['foo00'],
      isEnabled: false,
      startDate: '2024-09-12T14:17:54Z',
      endDate: '2024-12-19T04:20:03Z',
      countryCode: 'UK',
    });

    expect(mockPush).toHaveBeenCalledWith(
      `/category/rulesets/edit/${mockNewRuleset}`
    );
  });

  it('should show errors', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: 'Failed to fetch',
      isLoading: false,
    });

    renderWithProviders(<RuleSets />);

    expect(
      await screen.findByText(
        'Error whilst retrieving ruleset: "Error Failed to fetch 500"'
      )
    ).toBeVisible();
  });

  it('should have loading state', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: true,
    });
    renderWithProviders(<RuleSets />);

    await waitFor(() => {
      expect(screen.queryAllByText('Add new rule')).toHaveLength(0);
    });

    expect(screen.getByTestId('datatable-skeleton')).toBeVisible();
    expect(screen.getByTestId('table-pagination-skeleton')).toBeVisible();
  });

  it('should show country flag and filter', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          id: 'ewfw-e3f23-f23f2-3cwef3',
          categoriesInfo: [
            {
              id: 'catId',
            },
          ],
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
          countryCode: 'IE',
        },
      ],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<RuleSets />);

    expect(await screen.findByAltText('IE rule')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'All marksandspencer.com' })
    ).toBeVisible();
  });

  it('should refetch the ruleset list when the country is changed', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: mockRefetchRuleSetList,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<RuleSets />);

    const dropdown = screen.getByRole('button', {
      name: 'All marksandspencer.com',
    });

    await userEvent.click(dropdown);

    const showUK = screen.getByText('UK only marksandspencer');
    await userEvent.click(showUK);

    expect(mockRefetchRuleSetList).toHaveBeenCalledWith({ countryCode: 'UK' });
    expect(
      screen.getByRole('button', { name: 'UK only marksandspencer' })
    ).toBeVisible();

    const showIE = screen.getByText('IE only marksandspencer');
    await userEvent.click(showIE);

    expect(mockRefetchRuleSetList).toHaveBeenCalledWith({ countryCode: 'IE' });
    expect(
      screen.getByRole('button', { name: 'IE only marksandspencer' })
    ).toBeVisible();
  });
});
