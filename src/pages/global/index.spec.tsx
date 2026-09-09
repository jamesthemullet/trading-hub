import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { MerchandisingReturnedGlobalRuleSet } from '@/libs/api/generated/open-api';
import { track } from '@/libs/hooks/utils/analytics';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

const mockRuleSetDelete = jest.fn();
const mockRefetchRuleSetList = jest.fn();
const mockUpdateRuleSet = jest.fn();
const useRuleSet = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/utils/analytics', () => ({
  track: jest.fn(),
}));

const MOCK_CATEGORY_ID = 'Cat123';

const mockPush = jest.fn();

const server = setupServer(
  http.get(
    '/api/search/merchandising/v1/CLOTHING_AND_HOME/global/ruleset',
    (ctx) => {
      const url = new URL(ctx.request.url);
      const countryCode = url.searchParams.get('countryCode');
      const data = useRuleSet(
        url.searchParams.get('q'),
        Number(url.searchParams.get('start')),
        Number(url.searchParams.get('rows')),
        'global'
      );
      if ('refetchRuleSetList' in data) {
        data.refetchRuleSetList();
      }
      mockRefetchRuleSetList({
        countryCode,
      });
      return HttpResponse.json(
        {
          ruleSets: data.globalRuleSets,
          pagination: data.pagination,
        },
        { status: 200 }
      );
    }
  ),
  http.get('/api/search/merchandising/v1/CFTO/global/ruleset', (ctx) => {
    const url = new URL(ctx.request.url);
    const countryCode = url.searchParams.get('countryCode');
    const data = useRuleSet(
      url.searchParams.get('q'),
      Number(url.searchParams.get('start')),
      Number(url.searchParams.get('rows')),
      'global'
    );
    if ('refetchRuleSetList' in data) {
      data.refetchRuleSetList();
    }
    mockRefetchRuleSetList({
      countryCode,
      catalogue: 'CFTO',
    });
    return HttpResponse.json(
      {
        ruleSets: data.globalRuleSets,
        pagination: data.pagination,
      },
      { status: 200 }
    );
  }),
  http.get('/api/search/beta/merchandising/global/ruleset', (ctx) => {
    const url = new URL(ctx.request.url);
    const countryCode = url.searchParams.get('countryCode');
    const data = useRuleSet(
      url.searchParams.get('q'),
      Number(url.searchParams.get('start')),
      Number(url.searchParams.get('rows')),
      'global'
    );
    if ('refetchRuleSetList' in data) {
      data.refetchRuleSetList();
    }
    mockRefetchRuleSetList({
      countryCode,
    });
    return HttpResponse.json(
      {
        ruleSets: data.globalRuleSets,
        pagination: data.pagination,
      },
      { status: 200 }
    );
  }),
  http.delete('/api/search/beta/merchandising/global/ruleset/:id', (ctx) => {
    mockRuleSetDelete({ rulesetId: ctx.params.id });
    return HttpResponse.json({ id: ctx.params.id }, { status: 200 });
  }),
  http.get('/api/search/beta/merchandising/global/ruleset/:id', (ctx) => {
    const data = useRuleSet();
    const ruleSetReturned = data.globalRuleSets.find(
      (ruleSet: MerchandisingReturnedGlobalRuleSet) =>
        ruleSet.id === ctx.params.id
    );
    return HttpResponse.json(ruleSetReturned, { status: 200 });
  }),
  http.put('/api/search/beta/merchandising/global/ruleset/:id', async (ctx) => {
    const data = useRuleSet();
    const ruleSetReturned = data.globalRuleSets.find(
      (ruleSet: MerchandisingReturnedGlobalRuleSet) =>
        ruleSet.id === ctx.params.id
    );
    const ruleSet = (await ctx.request.json()) as object;
    mockUpdateRuleSet({ ruleSet, ruleSetId: ctx.params.id });
    return HttpResponse.json(
      { ...ruleSetReturned, ...ruleSet },
      { status: 200 }
    );
  }),
  http.put(
    '/api/search/merchandising/v1/:catalogue/global/ruleset/:id',
    async (ctx) => {
      const data = useRuleSet();
      const ruleSetReturned = data.globalRuleSets.find(
        (ruleSet: MerchandisingReturnedGlobalRuleSet) =>
          ruleSet.id === ctx.params.id
      );
      const ruleSet = (await ctx.request.json()) as object;
      mockUpdateRuleSet({
        ruleSet,
        ruleSetId: ctx.params.id,
        catalogue: ctx.params.catalogue,
      });
      return HttpResponse.json(
        { ...ruleSetReturned, ...ruleSet },
        { status: 200 }
      );
    }
  ),
  http.post(
    '/api/search/beta/merchandising/CLOTHING_AND_HOME/global/ruleset',
    async (ctx) => {
      const ruleSet = (await ctx.request.json()) as object;
      return HttpResponse.json(
        {
          id: MOCK_CATEGORY_ID,
          lastChanged: {
            date: '12/12/12',
            user: 'me',
          },
          ...ruleSet,
        },
        { status: 200 }
      );
    }
  ),
  http.post(
    '/api/search/beta/merchandising/CFTO/global/ruleset',
    async (ctx) => {
      const ruleSet = (await ctx.request.json()) as object;
      return HttpResponse.json(
        {
          id: MOCK_CATEGORY_ID,
          lastChanged: {
            date: '12/12/12',
            user: 'me',
          },
          ...ruleSet,
        },
        { status: 200 }
      );
    }
  )
);

const mockRouter = {
  query: {
    currentPage: '1',
    currentPageSize: '10',
    searchQuery: '',
  },
  push: mockPush,
  isReady: true,
  pathname: '/global',
};

describe('Index', () => {
  beforeAll(() => {
    server.listen();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      globalRuleSets: [],
      refetchRuleSetList: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
  });

  beforeEach(() => {
    server.resetHandlers();
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
      refetchRuleSetList: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    renderWithProviders(<RuleSets />);

    await waitFor(() => {
      expect(screen.getByText('Global')).toBeVisible();
    });
  });

  it('renders the add ranking rule button next to the title and tracks clicks', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    renderWithProviders(<RuleSets />);

    const addRankingRuleButton = await screen.findByRole('link', {
      name: 'Add ranking rule',
    });
    expect(addRankingRuleButton).toBeVisible();

    addRankingRuleButton.addEventListener('click', (event) =>
      event.preventDefault()
    );

    act(() => {
      addRankingRuleButton.click();
    });

    expect(track).toHaveBeenCalledWith({ event: 'Add global ranking rule' });
  });

  it('hides the add ranking rule button when the user lacks write access', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    renderWithProviders(<RuleSets />, ['Glob.R'], {
      featureFlags: { hasAuthorization: true },
    });

    await waitFor(() => {
      expect(screen.getByText('Global')).toBeVisible();
    });
    expect(
      screen.queryByRole('link', { name: 'Add ranking rule' })
    ).not.toBeInTheDocument();
  });

  it('displays the list of rules using the v1 endpoint when optimistic locking is enabled', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    renderWithProviders(<RuleSets />);

    await waitFor(() => {
      expect(screen.getByText('Global')).toBeVisible();
    });
    expect(mockRefetchRuleSetList).toHaveBeenCalled();
  });

  it('switches the ruleset catalogue when the cfto.com tab is selected', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    renderWithProviders(<RuleSets />, ['Cat.W', 'Search.W', 'Glob.W'], {
      featureFlags: { hasCfto: true },
    });

    await waitFor(() => {
      expect(mockRefetchRuleSetList).toHaveBeenCalled();
    });

    await user.click(screen.getByText('cfto.com'));

    await waitFor(() => {
      expect(mockRefetchRuleSetList).toHaveBeenCalledWith(
        expect.objectContaining({ catalogue: 'CFTO' })
      );
    });
  });

  it('opens the cfto.com tab when navigated back to with a CFTO catalogue query param', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      query: { ...mockRouter.query, catalogue: 'CFTO' },
    });

    renderWithProviders(<RuleSets />, ['Cat.W', 'Search.W', 'Glob.W'], {
      featureFlags: { hasCfto: true },
    });

    await waitFor(() => {
      expect(mockRefetchRuleSetList).toHaveBeenCalledWith(
        expect.objectContaining({ catalogue: 'CFTO' })
      );
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('links the add ranking rule button to the CFTO catalogue when the cfto.com tab is selected', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      globalRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    renderWithProviders(<RuleSets />, ['Cat.W', 'Search.W', 'Glob.W'], {
      featureFlags: { hasCfto: true },
    });

    await user.click(screen.getByText('cfto.com'));

    const addRankingRuleButton = await screen.findByRole('link', {
      name: 'Add ranking rule',
    });

    expect(addRankingRuleButton).toHaveAttribute(
      'href',
      '/global/rulesets/new?catalogue=CFTO'
    );
  });

  it('hides all catalogue tabs when the CFTO feature flag is disabled', () => {
    renderWithProviders(<RuleSets />);

    expect(screen.queryByText('cfto.com')).not.toBeInTheDocument();
    expect(screen.queryByText('marksandspencer.com')).not.toBeInTheDocument();
  });

  it('does not change tab while the router is not ready', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      isReady: false,
      query: { ...mockRouter.query, catalogue: 'CFTO' },
    });

    renderWithProviders(<RuleSets />, ['Cat.W', 'Search.W', 'Glob.W'], {
      featureFlags: { hasCfto: true },
    });

    expect(screen.getByText('marksandspencer.com')).toBeVisible();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
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

  it('should search', async () => {
    const user = userEvent.setup();

    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      globalRuleSets: [],
      refetchRuleSetList: jest.fn(),
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
        pathname: '/global',
        query: {
          searchQuery: 'search-search',
          currentPage: 1,
          currentPageSize: 10,
        },
      })
    );
  });

  describe('Rulesets', () => {
    it('should enable or disable a ruleset', async () => {
      const user = userEvent.setup();
      const mockId = 'ewfw-e3f23-f23f2-3cwef3';
      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        globalRuleSets: [
          {
            id: mockId,
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
            facets: [],
          },
        ],
        refetchRuleSetList: jest.fn(),
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<RuleSets />);

      const rulesetToggle = await screen.findAllByTitle('Toggle');

      await userEvent.click(rulesetToggle[0]);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: 'Review changes',
          })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(mockUpdateRuleSet).toHaveBeenCalledWith({
        ruleSetId: mockId,
        ruleSet: {
          isEnabled: false,
          facets: [],
          rules: mockMerchandisingRules,
        },
        catalogue: 'CLOTHING_AND_HOME',
      });
    });

    it('enables or disables a ruleset against the CFTO catalogue when the cfto.com tab is selected', async () => {
      const user = userEvent.setup();
      const mockId = 'cfto-toggle-ruleset-id';
      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        globalRuleSets: [
          {
            id: mockId,
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
            facets: [],
          },
        ],
        refetchRuleSetList: jest.fn(),
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<RuleSets />, ['Cat.W', 'Search.W', 'Glob.W'], {
        featureFlags: { hasCfto: true },
      });

      await user.click(screen.getByText('cfto.com'));

      const rulesetToggle = await screen.findAllByTitle('Toggle');

      await user.click(rulesetToggle[0]);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: 'Review changes',
          })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mockUpdateRuleSet).toHaveBeenCalledWith({
          ruleSetId: mockId,
          ruleSet: {
            isEnabled: false,
            facets: [],
            rules: mockMerchandisingRules,
          },
          catalogue: 'CFTO',
        });
      });
    });

    it('should delete a ruleset', async () => {
      const mockId = 'fdq3r3-123d3-f32f23f-23r2';
      const user = userEvent.setup();
      const mockRefetchRulesList = jest.fn();

      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        globalRuleSets: [
          {
            id: mockId,
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
            facets: [],
          },
        ],
        refetchRuleSetList: mockRefetchRulesList,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<RuleSets />);

      const rulesetDropdown = await screen.findAllByTitle('More options');

      await user.click(rulesetDropdown[0]);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Do you want to delete this rule?',
          })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Do you want to delete this rule?',
          })
        ).not.toBeVisible();
      });

      await user.click(rulesetDropdown[0]);
      const reRenderedDeleteButton = screen.getByTestId(
        'Delete rule via dropdown'
      );
      await user.click(reRenderedDeleteButton);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Do you want to delete this rule?',
          })
        ).toBeVisible();
      });
      await user.click(screen.getByTestId('Delete rule'));

      expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
      expect(mockRefetchRulesList).toHaveBeenCalled();
    });

    it('should display country flag and filter', async () => {
      jest.mocked(useRuleSet).mockReturnValue({
        globalRuleSets: [
          {
            id: '1234',
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
            facets: [],
            countryCode: 'UK',
          },
        ],
        pagination: {
          totalItems: undefined,
        },
        categoryRuleSets: [],
        refetchRuleSetList: jest.fn(),
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<RuleSets />);

      expect(await screen.findByAltText('UK rule')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^Filter by country/i })
      ).toBeVisible();
    });

    it('should refetch the ruleset list when the country is changed', async () => {
      const user = userEvent.setup();
      jest.mocked(useRuleSet).mockReturnValue({
        globalRuleSets: [
          {
            id: '1234',
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
            facets: [],
            countryCode: 'UK',
          },
        ],
        pagination: {
          totalItems: undefined,
        },
        categoryRuleSets: [],
        refetchRuleSetList: mockRefetchRuleSetList,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<RuleSets />);
      const dropdown = screen.getByRole('button', {
        name: /^Filter by country/i,
      });

      await user.click(dropdown);

      const showUK = screen.getByText('UK only marksandspencer');
      await user.click(showUK);

      expect(mockRefetchRuleSetList).toHaveBeenCalledWith({
        countryCode: 'UK',
      });
      expect(screen.getAllByText('UK only marksandspencer')[0]).toBeVisible();

      const showIE = screen.getByText('IE only marksandspencer');
      await userEvent.click(showIE);

      expect(mockRefetchRuleSetList).toHaveBeenCalledWith({
        countryCode: 'IE',
      });
      expect(screen.getAllByText('IE only marksandspencer')[0]).toBeVisible();
    });

    it('duplicates a ruleset against the CFTO catalogue when the cfto.com tab is selected', async () => {
      const user = userEvent.setup();
      const mockId = 'cfto-ruleset-id';
      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        globalRuleSets: [
          {
            id: mockId,
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
            facets: [],
          },
        ],
        refetchRuleSetList: jest.fn(),
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<RuleSets />, ['Cat.W', 'Search.W', 'Glob.W'], {
        featureFlags: { hasCfto: true },
      });

      await user.click(screen.getByText('cfto.com'));

      const rulesetDropdown = await screen.findAllByTitle('More options');
      await user.click(rulesetDropdown[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Create a duplicate rule' })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(track).toHaveBeenCalledWith({
          event: 'Duplicate global ruleset',
        });
      });
    });

    it('duplicates a ruleset against the default catalogue', async () => {
      const user = userEvent.setup();
      const mockId = 'default-ruleset-id';
      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        globalRuleSets: [
          {
            id: mockId,
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
            facets: [],
          },
        ],
        refetchRuleSetList: jest.fn(),
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<RuleSets />);

      const rulesetDropdown = await screen.findAllByTitle('More options');
      await user.click(rulesetDropdown[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Create a duplicate rule' })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(track).toHaveBeenCalledWith({
          event: 'Duplicate global ruleset',
        });
      });
    });
  });
});
