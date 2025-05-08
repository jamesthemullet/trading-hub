import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { renderWithProviders } from '@/test/render-with-providers';

import { default as FacetManagementPage } from './index.page';

const mockRefetchRuleSetList = jest.fn();
const mockRuleSetDelete = jest.fn();
const mockUpdateGlobalRuleSet = jest.fn();
const useRuleSet = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const updateGlobalRuleSet = {
  saveGlobalRuleset: mockUpdateGlobalRuleSet,
  error: '',
  isSaving: true,
};
const deleteGlobalRuleSet = {
  handleDelete: mockRuleSetDelete,
  error: '',
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

const MOCK_CATEGORY_ID = 'Cat123';
const NEW_RULE_BUTTON_TEXT = 'Add facet rule';
const mockId = 'ewfw-e3f23-f23f2-3cwef3';

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
        ruleSets: data.globalRuleSets,
        pagination: data.pagination,
      },
      { status: 200 }
    );
  }),
  http.delete('/api/search/beta/merchandising/global/ruleset/:id', (ctx) => {
    if (deleteGlobalRuleSet.error !== '') {
      const response = HttpResponse.json(
        {
          message: deleteGlobalRuleSet.error,
          status: 500,
        },
        { status: 500 }
      );
      deleteGlobalRuleSet.error = '';
      return response;
    }
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
    if (updateGlobalRuleSet.error !== '') {
      const response = HttpResponse.json(
        {
          message: updateGlobalRuleSet.error,
          status: 500,
        },
        { status: 500 }
      );
      updateGlobalRuleSet.error = '';
      return response;
    }
    const data = useRuleSet();
    const ruleSetReturned = data.globalRuleSets.find(
      (ruleSet: any) => ruleSet.id === ctx.params.id
    );
    const ruleSet = (await ctx.request.json()) as object;
    mockUpdateGlobalRuleSet({ ruleSet, ruleSetId: ctx.params.id });
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

const mockPush = jest.fn();
const mockRouter = {
  query: {
    currentPage: '1',
    currentPageSize: '10',
    searchQuery: '',
  },
  push: mockPush,
  isReady: true,
  pathname: '/global/facets',
};

describe('Global Facet Management', () => {
  beforeAll(() => {
    server.listen();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    jest.mocked(useRuleSet).mockReturnValue({
      globalRuleSets: [
        {
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
        },
      ],
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setGlobalRuleSets: jest.fn(),
      setCategoryRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('displays the list of facets', async () => {
    renderWithProviders(<FacetManagementPage />);

    expect(await screen.findByText('*')).toBeVisible();
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<FacetManagementPage />, [], {
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

  it('should not display the duplicate button', async () => {
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
    renderWithProviders(<FacetManagementPage />);

    const rulesetDropdown = await screen.findAllByTitle('More options');

    await user.click(rulesetDropdown[0]);

    expect(screen.queryByTitle('Duplicate')).not.toBeInTheDocument();
  });

  it('creates a new rule set and redirects to the edit page', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      globalRuleSets: [
        {
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
        },
      ],
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetManagementPage />);

    const createButton = await screen.findByText(NEW_RULE_BUTTON_TEXT);
    act(() => {
      createButton.click();
    });

    expect(await screen.findByText(NEW_RULE_BUTTON_TEXT)).toBeInTheDocument();

    expect(mockPush).toHaveBeenCalledWith(
      `/global/facets/edit/${MOCK_CATEGORY_ID}`
    );
  });

  it('should open delete modal and close on cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

    await user.type(search, 'search-search');

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/global/facets',
        query: {
          searchQuery: 'search-search',
          currentPage: 1,
          currentPageSize: 10,
        },
      })
    );
  });

  it('should enable or disable a global ruleset', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

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

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith({
      ruleSetId: mockId,
      ruleSet: {
        isEnabled: false,
        rules: mockMerchandisingRules,
      },
    });
  });

  it('should delete a ruleset', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FacetManagementPage />);

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
  });

  describe('Error display', () => {
    it('should display an error message when fetching the global ruleset fails', async () => {
      jest.mocked(useRuleSet).mockReturnValue({
        globalRuleSets: [],
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        refetchRuleSetList: () => jest.fn,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: 'An error occurred',
        isLoading: false,
      });

      renderWithProviders(<FacetManagementPage />);

      expect(
        await screen.findByText(
          'Error whilst retrieving ruleset: "Error An error occurred 500"'
        )
      ).toBeVisible();
    });

    it('should display an error message when updating a global ruleset fails', async () => {
      const user = userEvent.setup();
      updateGlobalRuleSet.error = 'An error occurred';
      jest.mocked(useRuleSet).mockReturnValue({
        globalRuleSets: [
          {
            id: mockId,
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
          },
        ],
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        refetchRuleSetList: () => jest.fn,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<FacetManagementPage />);

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

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error whilst updating ruleset: "Error An error occurred 500"'
          )
        ).toBeVisible();
      });
    });

    it('should display an error message when deleting a global ruleset fails', async () => {
      const user = userEvent.setup();
      deleteGlobalRuleSet.error = 'An error occurred';
      jest.mocked(useRuleSet).mockReturnValue({
        globalRuleSets: [
          {
            id: mockId,
            isEnabled: true,
            lastChanged: {
              user: 'user',
              date: '2021-01-01',
            },
            rules: mockMerchandisingRules,
          },
        ],
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        refetchRuleSetList: () => jest.fn,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<FacetManagementPage />);

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
      await user.click(screen.getByTestId('Delete rule'));

      expect(
        screen.getByText(
          'Error whilst deleting ruleset: "Error An error occurred 500"'
        )
      ).toBeVisible();
    });
  });

  it('should show the country flag and filter', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      globalRuleSets: [
        {
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          countryCode: 'IE',
        },
      ],
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetManagementPage />);

    expect(await screen.findByAltText('IE rule')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'All marksandspencer.com' })
    ).toBeVisible();
  });

  it('should refetch the ruleset list when the country is changed', async () => {
    const user = userEvent.setup();
    jest.mocked(useRuleSet).mockReturnValue({
      globalRuleSets: [
        {
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          countryCode: 'UK',
        },
      ],
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: mockRefetchRuleSetList,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetManagementPage />);
    const dropdown = screen.getByRole('button', {
      name: 'All marksandspencer.com',
    });

    await user.click(dropdown);

    const showUK = screen.getByText('UK only marksandspencer');
    await user.click(showUK);

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
