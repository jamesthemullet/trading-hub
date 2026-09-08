import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { track } from '@/libs/hooks/utils/analytics';
import { returnedRedirectMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import RedirectRuleSets from './index.page';

const mockNewRuleset = 'foo123';

const mockRefetchRedirectList = jest.fn();
const mockRedirectDelete = jest.fn();
const mockUpdateRedirect = jest.fn();
const useSearchRedirectList = jest.fn();
const createRedirect = jest.fn().mockResolvedValue({ id: mockNewRuleset });

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/utils/analytics', () => ({
  track: jest.fn(),
}));

const server = setupServer(
  http.get('/api/search/beta/merchandising/keyword/redirect', (ctx) => {
    const url = new URL(ctx.request.url);
    const countryCode = url.searchParams.get('countryCode');
    const data = useSearchRedirectList(
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
    mockRefetchRedirectList({
      countryCode,
    });
    return HttpResponse.json(
      {
        redirects: data.redirects,
        pagination: data.pagination,
      },
      { status: 200 }
    );
  }),
  http.delete('/api/search/beta/merchandising/keyword/redirect/:id', (ctx) => {
    mockRedirectDelete({ redirectId: ctx.params.id });
    return HttpResponse.json({ id: ctx.params.id }, { status: 200 });
  }),
  http.get('/api/search/beta/merchandising/keyword/redirect/:id', (ctx) => {
    const data = useSearchRedirectList();
    type Redirect = typeof returnedRedirectMock;
    const ruleSetReturned = data.redirects.find(
      (ruleSet: Redirect) => ruleSet.id === ctx.params.id
    );
    return HttpResponse.json(ruleSetReturned, { status: 200 });
  }),
  http.put(
    '/api/search/beta/merchandising/keyword/redirect/:id',
    async (ctx) => {
      const data = useSearchRedirectList();
      type Redirect = typeof returnedRedirectMock;
      const redirectReturned = data.redirects.find(
        (ruleSet: Redirect) => ruleSet.id === ctx.params.id
      );
      const redirect = (await ctx.request.json()) as object;
      mockUpdateRedirect({
        redirect: {
          ...redirectReturned,
          ...redirect,
        },
        redirectId: ctx.params.id,
      });
      return HttpResponse.json(
        { ...redirectReturned, ...redirect },
        { status: 200 }
      );
    }
  ),
  http.post('/api/search/beta/merchandising/keyword/redirect', async (ctx) => {
    const redirect = (await ctx.request.json()) as object;
    const response = {
      redirect: {
        ...redirect,
        id: '9a32d206-6b7f-47a2-8f83-578429d2a024',
        lastChanged: {
          date: '2024-08-01T09:37:06.109Z',
          user: 'Jo Smith',
        },
      },
    };
    createRedirect(response);
    return HttpResponse.json(
      {
        ...redirect,
        id: mockNewRuleset,
        lastChanged: {
          date: '2024-08-01T09:37:06.109Z',
          user: 'Jo Smith',
        },
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
      pathname: '/search/redirects',
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

  it('displays the list of redirects', async () => {
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(<RedirectRuleSets />);

    await waitFor(() => {
      expect(screen.getByText('Keyword Redirect')).toBeVisible();
    });
  });

  it('renders the add redirect rule button next to the title and tracks clicks', async () => {
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(<RedirectRuleSets />);

    const addRedirectRuleButton = await screen.findByRole('link', {
      name: 'Add redirect rule',
    });
    expect(addRedirectRuleButton).toBeVisible();

    addRedirectRuleButton.addEventListener('click', (event) =>
      event.preventDefault()
    );

    act(() => {
      addRedirectRuleButton.click();
    });

    expect(track).toHaveBeenCalledWith({ event: 'Add redirect rule' });
  });

  it('hides the add redirect rule button when the user lacks write access', async () => {
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(<RedirectRuleSets />, ['Search.R'], {
      featureFlags: { hasAuthorization: true },
    });

    await waitFor(() => {
      expect(screen.getByText('Keyword Redirect')).toBeVisible();
    });
    expect(
      screen.queryByRole('link', { name: 'Add redirect rule' })
    ).not.toBeInTheDocument();
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<RedirectRuleSets />, [], {
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
    const mockKeywords = ['search', 'terms'];
    const user = userEvent.setup();

    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [{ ...returnedRedirectMock, keywords: mockKeywords }],
      pagination: {
        totalItems: 1,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });
    renderWithProviders(<RedirectRuleSets />);

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

    await user.type(search, mockKeywords[0]);

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/search/redirects',
        query: {
          searchQuery: mockKeywords[0],
          currentPage: 1,
          currentPageSize: 10,
        },
      })
    );
  });

  it('should bold text that matches search', async () => {
    const mockSearchTerms = ['search', 'terms'];
    const mockRouter = {
      pathname: '/search/redirects',
      query: {
        currentPage: '1',
        currentPageSize: '10',
        searchQuery: 'search',
      },
      isReady: true,
      push: mockPush,
    };
    jest.mocked(useRouter as jest.Mock).mockReturnValue(mockRouter);

    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [{ ...returnedRedirectMock, keywords: mockSearchTerms }],
      pagination: {
        totalItems: 1,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(<RedirectRuleSets />);

    const boldText = await screen.findByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'b' && content.includes('search')
      );
    });

    expect(boldText).toHaveStyle('font-weight: bold');
  });

  it('should enable or disable a redirect', async () => {
    const mockId = returnedRedirectMock.id;
    const mockKeywords = ['search', 'terms'];

    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [{ ...returnedRedirectMock, keywords: mockKeywords }],
      pagination: {
        totalItems: 1,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });
    renderWithProviders(<RedirectRuleSets />);

    const rulesetToggle = await screen.findAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Review changes' })
      ).toBeVisible();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockUpdateRedirect).toHaveBeenCalledWith({
      redirectId: mockId,
      redirect: {
        ...returnedRedirectMock,
        isEnabled: false,
        keywords: mockKeywords,
      },
    });
  });

  it('should duplicate a ruleset', async () => {
    const user = userEvent.setup();
    const mockKeywords = ['search', 'terms'];
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [{ ...returnedRedirectMock, keywords: mockKeywords }],
      pagination: {
        totalItems: 1,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });
    renderWithProviders(<RedirectRuleSets />);

    await user.click((await screen.findAllByTitle('More options'))[0]);
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Create a duplicate redirect rule',
        })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Confirm',
    });
    await user.click(confirmButton);
    expect(createRedirect).toHaveBeenCalledWith({
      redirect: {
        destinationUrl: 'l/women/dresses',
        endDate: '2024-08-01T09:37:06.109Z',
        id: '9a32d206-6b7f-47a2-8f83-578429d2a024',
        isEnabled: false,
        keywords: ['search', 'terms'],
        lastChanged: {
          date: '2024-08-01T09:37:06.109Z',
          user: 'Jo Smith',
        },
        ruleTitle: 'title of redirect',
        startDate: '2024-08-01T09:37:06.109Z',
        type: 'redirectTerm',
      },
    });
  });

  it('should delete a ruleset', async () => {
    const mockId = returnedRedirectMock.id;
    const mockKeywords = ['search', 'terms'];

    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [{ ...returnedRedirectMock, keywords: mockKeywords }],
      pagination: {
        totalItems: 1,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });
    renderWithProviders(<RedirectRuleSets />);

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
    expect(mockRedirectDelete).toHaveBeenCalledWith({ redirectId: mockId });
  });

  it('should display country flag and filter', async () => {
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [
        {
          ...returnedRedirectMock,
          countryCode: 'IE',
        },
      ],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: () => jest.fn,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(<RedirectRuleSets />);

    expect(await screen.findByAltText('IE rule')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Filter by country/i })
    ).toBeVisible();
  });

  it('should refetch the ruleset list when the country is changed', async () => {
    const user = userEvent.setup();
    jest.mocked(useSearchRedirectList).mockReturnValue({
      redirects: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRedirectList: mockRefetchRedirectList,
      setKeywordList: jest.fn(),
    });

    renderWithProviders(<RedirectRuleSets />);

    const dropdown = screen.getByRole('button', {
      name: /^Filter by country/i,
    });

    await user.click(dropdown);

    const showUK = screen.getByText('UK only marksandspencer');
    await user.click(showUK);

    expect(mockRefetchRedirectList).toHaveBeenCalledWith({ countryCode: 'UK' });
    expect(screen.getAllByText('UK only marksandspencer')[0]).toBeVisible();

    const showIE = screen.getByText('IE only marksandspencer');
    await userEvent.click(showIE);

    expect(mockRefetchRedirectList).toHaveBeenCalledWith({ countryCode: 'IE' });
    expect(screen.getAllByText('IE only marksandspencer')[0]).toBeVisible();
  });
});
