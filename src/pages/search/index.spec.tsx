import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type {
  MerchandisingKeywordRuleSet,
  MerchandisingReturnedKeywordRuleSet,
} from '@/libs/api';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

const mockNewRuleset = 'foo123';
const mockId = 'ewfw-e3f23-f23f2-3cwef3';
const mockSearchTerms = ['search', 'terms'];

const mockRefetchRuleSetList = jest.fn();
const mockUpdateRuleSet = jest.fn();
const mockRuleSetDelete = jest.fn();
const mockRuleSetCreate = jest.fn().mockResolvedValue({ id: mockNewRuleset });
const useSearchRulesetList = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const server = setupServer(
  http.get('/api/search/beta/merchandising/keyword/ruleset', (ctx) => {
    const url = new URL(ctx.request.url);
    const countryCode = url.searchParams.get('countryCode');
    const data = useSearchRulesetList(
      url.searchParams.get('q'),
      Number(url.searchParams.get('start')),
      Number(url.searchParams.get('rows'))
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
        ruleSets: data.ruleSets,
        pagination: data.pagination,
      },
      { status: 200 }
    );
  }),
  http.delete('/api/search/beta/merchandising/keyword/ruleset/:id', (ctx) => {
    mockRuleSetDelete({ rulesetId: ctx.params.id });
    return HttpResponse.json({ id: ctx.params.id }, { status: 200 });
  }),
  http.get('/api/search/beta/merchandising/keyword/ruleset/:id', (ctx) => {
    const data = useSearchRulesetList();
    const ruleSetReturned = data.ruleSets.find(
      (ruleSet: MerchandisingReturnedKeywordRuleSet) =>
        ruleSet.id === ctx.params.id
    );
    return HttpResponse.json(ruleSetReturned, { status: 200 });
  }),
  http.put(
    '/api/search/beta/merchandising/keyword/ruleset/:id',
    async (ctx) => {
      const data = useSearchRulesetList();
      const ruleSetReturned: MerchandisingReturnedKeywordRuleSet =
        data.ruleSets.find(
          (ruleSet: MerchandisingReturnedKeywordRuleSet) =>
            ruleSet.id === ctx.params.id
        );
      const rules = (await ctx.request.json()) as MerchandisingKeywordRuleSet;
      mockUpdateRuleSet({
        searchTerms: ruleSetReturned.searchTerms,
        ruleSetId: ruleSetReturned.id,
        rules: {
          facets: rules.facets,
          isEnabled: rules.isEnabled,
          rules: rules.rules,
          startDate: rules.startDate,
          endDate: rules.endDate,
        },
      });
      return HttpResponse.json(
        { ...ruleSetReturned, ...rules },
        { status: 200 }
      );
    }
  ),
  http.post('/api/search/beta/merchandising/keyword/ruleset', async (ctx) => {
    const ruleSet = (await ctx.request.json()) as MerchandisingKeywordRuleSet;
    mockRuleSetCreate({
      merchandisingRules: ruleSet.rules,
      searchTerms: ruleSet.searchTerms,
      countryCode: ruleSet.countryCode,
    });
    return HttpResponse.json(
      {
        id: mockNewRuleset,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        ...ruleSet,
      },
      { status: 200 }
    );
  })
);

const mockPush = jest.fn();

describe('Search Rulesets', () => {
  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();
    const mockRouter = {
      pathname: '/search',
      query: {
        currentPage: '1',
        currentPageSize: '10',
        searchQuery: '',
      },
      isReady: true,
      push: mockPush,
    };
    jest.mocked(useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterAll(() => {
    server.close();
    jest.resetAllMocks();
  });

  it('displays the list of rules', async () => {
    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    renderWithProviders(<RuleSets />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Search', level: 1 })
      ).toBeVisible();
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
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];
    const user = userEvent.setup();
    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
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
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    renderWithProviders(<RuleSets />);

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

    await user.type(search, mockSearchTerms[0]);

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/search',
        query: {
          searchQuery: mockSearchTerms[0],
          currentPage: 1,
          currentPageSize: 10,
        },
      })
    );
  });

  it('should bold text that matches search', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];
    const mockRouter = {
      pathname: '/search',
      query: {
        currentPage: '1',
        currentPageSize: '10',
        searchQuery: 'search',
      },
      isReady: true,
      push: mockPush,
    };
    jest.mocked(useRouter as jest.Mock).mockReturnValue(mockRouter);

    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
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
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(<RuleSets />);

    const boldText = await screen.findByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'b' && content.includes('search')
      );
    });

    expect(boldText).toHaveStyle('font-weight: bold');
  });

  it('should enable or disable a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];

    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
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
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(<RuleSets />);

    const rulesetToggle = await screen.findAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Review changes' })
      ).toBeVisible();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      searchTerms: mockSearchTerms,
      ruleSetId: mockId,
      rules: {
        facets: [],
        isEnabled: false,
        rules: mockMerchandisingRules,
      },
    });
  });

  it('should enable or disable a scheduled ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];

    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-14T10:02:38.556Z',
        },
      ],
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(<RuleSets />);

    const rulesetToggle = await screen.findAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Review changes' })
      ).toBeVisible();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      searchTerms: mockSearchTerms,
      ruleSetId: mockId,
      rules: {
        facets: [],
        isEnabled: false,
        rules: mockMerchandisingRules,
        startDate: '2024-10-14T10:02:38.556Z',
        endDate: '2024-10-14T10:02:38.556Z',
      },
    });
  });

  it('should duplicate a ruleset', async () => {
    const user = userEvent.setup();
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];
    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
          countryCode: 'UK_IE',
        },
      ],
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
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
    expect(mockRuleSetCreate).toHaveBeenCalledWith({
      merchandisingRules: mockMerchandisingRules,
      searchTerms: mockSearchTerms,
      countryCode: 'UK_IE',
    });

    expect(await screen.findAllByAltText('UK rule')).toHaveLength(2);
    expect(await screen.findAllByAltText('IE rule')).toHaveLength(2);
  });

  it('should delete a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];

    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
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
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(<RuleSets />);

    const user = userEvent.setup();

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

    await user.click(screen.getByTestId('Delete rule'));
    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
  });

  it('should display country flag and filter', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];

    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
          id: mockId,
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
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(<RuleSets />);

    expect(await screen.findByAltText('UK rule')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Filter by country/i })
    ).toBeVisible();
  });

  it('should refetch the ruleset list when the country is changed', async () => {
    const user = userEvent.setup();
    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-14T10:02:38.556Z',
        },
      ],
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: mockRefetchRuleSetList,
      setRuleSets: jest.fn(),
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
});
