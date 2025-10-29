import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

const mockRuleSetDelete = jest.fn();
const mockRefetchRuleSetList = jest.fn();
const mockUpdateRuleSet = jest.fn();
const useRuleSet = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

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

const MOCK_CATEGORY_ID = 'Cat123';

const mockPush = jest.fn();

const server = setupServer(
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
      (ruleSet: any) => ruleSet.id === ctx.params.id
    );
    return HttpResponse.json(ruleSetReturned, { status: 200 });
  }),
  http.put('/api/search/beta/merchandising/global/ruleset/:id', async (ctx) => {
    const data = useRuleSet();
    const ruleSetReturned = data.globalRuleSets.find(
      (ruleSet: any) => ruleSet.id === ctx.params.id
    );
    const ruleSet = (await ctx.request.json()) as object;
    mockUpdateRuleSet({ ruleSet, ruleSetId: ctx.params.id });
    return HttpResponse.json(
      { ...ruleSetReturned, ...ruleSet },
      { status: 200 }
    );
  }),
  http.post('/api/search/beta/merchandising/global/ruleset', async (ctx) => {
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
  })
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
      refetchRuleSetList: () => jest.fn,
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
      refetchRuleSetList: () => jest.fn,
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
        refetchRuleSetList: () => jest.fn,
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
            name: 'Apply global changes',
          })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Apply action' }));

      expect(mockUpdateRuleSet).toHaveBeenCalledWith({
        ruleSetId: mockId,
        ruleSet: {
          isEnabled: false,
          facets: [],
          rules: mockMerchandisingRules,
        },
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

      await user.click(rulesetDropdown[0]);
      const reRenderedDeleteButton = screen.getByTestId(
        'Delete rule via dropdown'
      );
      await user.click(reRenderedDeleteButton);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 3,
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
        refetchRuleSetList: () => jest.fn,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<RuleSets />);

      expect(await screen.findByAltText('UK rule')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Select country' })
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
        name: 'Select country',
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
  });
});
