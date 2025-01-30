import { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { ReturnedCategoryRuleSet } from '@/libs/api';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as FacetManagementPage } from './index.page';

const mockNewRuleset = 'foo123';

const handleDeleteMock = jest.fn();
const mockRefetchRuleSetList = jest.fn();
const createRuleset = jest.fn().mockResolvedValue({ id: mockNewRuleset });

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const useRuleSet = jest.fn();

const server = setupServer(
  http.get(`/api/search/beta/merchandising/category/ruleset`, (ctx) => {
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
  http.delete(`/api/search/beta/merchandising/category/ruleset/:id`, (ctx) => {
    if (mockRuleSetDelete.error !== '') {
      const response = HttpResponse.json(
        {
          message: mockRuleSetDelete.error,
          status: 500,
        },
        { status: 500 }
      );
      mockRuleSetDelete.error = '';
      return response;
    }
    handleDeleteMock({ rulesetId: ctx.params.id });
    return HttpResponse.json({ id: ctx.params.id }, { status: 200 });
  }),
  http.get(`/api/search/beta/merchandising/category/ruleset/:id`, (ctx) => {
    const data = useRuleSet();
    const ruleSetReturned = data.categoryRuleSets.find(
      (ruleSet: any) => ruleSet.id === ctx.params.id
    );
    return HttpResponse.json(ruleSetReturned, { status: 200 });
  }),
  http.put(
    `/api/search/beta/merchandising/category/ruleset/:id`,
    async (ctx) => {
      if (mockUpdateRuleSet.error !== '') {
        const response = HttpResponse.json(
          {
            message: mockUpdateRuleSet.error,
            status: 500,
          },
          { status: 500 }
        );
        mockUpdateRuleSet.error = '';
        return response;
      }
      const data = useRuleSet();
      const ruleSetReturned = data.categoryRuleSets.find(
        (ruleSet: any) => ruleSet.id === ctx.params.id
      );
      const ruleSet = (await ctx.request.json()) as object;
      handleUpdateMock({ ...ruleSet, ruleSetId: ctx.params.id });
      return HttpResponse.json(
        { ...ruleSetReturned, ...ruleSet },
        { status: 200 }
      );
    }
  ),
  http.post(`/api/search/beta/merchandising/category/ruleset`, async (ctx) => {
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

const mockRuleSetDelete = {
  handleDelete: handleDeleteMock,
  error: '',
};

const handleUpdateMock = jest.fn();
const mockUpdateRuleSet = {
  updateCategoryRuleSet: handleUpdateMock,
  isSaving: false,
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

const mockPush = jest.fn();
const mockRouter = {
  pathname: '/category/facets',
  query: {
    currentPage: '1',
    currentPageSize: '10',
    searchQuery: '',
  },
  isReady: true,
  push: mockPush,
};

describe('Category facet management', () => {
  beforeAll(() => {
    server.listen();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
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
      categoryRuleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoriesInfo: [
          {
            id: `${i}`,
            name: `identifier-${i}`,
          },
        ],
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
    renderWithProviders(<FacetManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Category Facet Management')).toBeVisible();
    });
    expect(await screen.findByText('Add new facet')).toBeVisible();
    expect(await screen.findByText('1 - identifier-1')).toBeVisible();
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

    renderWithProviders(<FacetManagementPage />);

    const createButton = await screen.findByText('Add new facet');
    act(() => {
      createButton.click();
    });

    expect(mockPush).toHaveBeenCalledWith('/category/facets/new');
  });

  it('should open delete modal and close on cancel', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          id: mockId,
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
        },
      ] as ReturnedCategoryRuleSet[],
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

    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

    await user.click((await screen.findAllByTitle('More options'))[0]);
    await user.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).toBeVisible();
    });

    await user.click(screen.getByLabelText('Delete rule'));
    expect(handleDeleteMock).toHaveBeenCalledWith({ rulesetId: mockId });
  });

  it('should search', async () => {
    const user = userEvent.setup();
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

    renderWithProviders(<FacetManagementPage />);

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

    await user.type(search, 'search-search');

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/category/facets',
        query: {
          searchQuery: 'search-search',
          currentPage: 1,
          currentPageSize: 10,
        },
      })
    );
  });

  it('should enable or disable a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';

    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          countryCode: 'UK_IE',
          categoriesInfo: [
            {
              id: 'foo00',
            },
          ],
          id: mockId,
          ruleSetId: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
          excludedFacets: {
            facets: [
              {
                id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
              },
            ],
          },
        },
        {
          countryCode: 'UK_IE',
          id: 'ewfw-e3f23-f23f2-3cwef4',
          ruleSetId: 'ewfw-e3f23-f23f2-3cwef4',
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
          facets: [],
        },
      ],
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

    renderWithProviders(<FacetManagementPage />);

    const rulesetToggle = await screen.findAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(handleUpdateMock).toHaveBeenCalledWith({
      countryCode: 'UK_IE',
      categoryIds: ['foo00'],
      ruleSetId: mockId,
      rules: mockMerchandisingRules,
      facets: [],
      excludedFacets: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
          },
        ],
      },
      isEnabled: false,
    });
  });

  it('should enable or disable a scheduled ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';

    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          countryCode: 'UK_IE',
          categoriesInfo: [
            {
              id: 'foo00',
            },
          ],
          id: mockId,
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
              id: 'foo00',
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

    renderWithProviders(<FacetManagementPage />);

    const rulesetToggle = await screen.findAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(handleUpdateMock).toHaveBeenCalledWith({
      countryCode: 'UK_IE',
      categoryIds: ['foo00'],
      ruleSetId: mockId,
      rules: mockMerchandisingRules,
      facets: [],
      isEnabled: false,
      startDate: '2024-10-14T10:02:38.556Z',
      endDate: '2024-10-15T10:02:38.556Z',
    });
  });

  it('should have loading state', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoriesInfo: [
          {
            id: `${i}`,
          },
        ],
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
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: true,
    });
    renderWithProviders(<FacetManagementPage />);

    await waitFor(() => {
      expect(
        screen.getByLabelText('table-pagination-skeleton')
      ).toBeInTheDocument();
    });
  });

  it('should duplicate a ruleset', async () => {
    const user = userEvent.setup();
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockFacets = [
      {
        id: '4f8d4802-3eb0-11ef-9a6a-000000000000',
        excludedValues: [],
        boosted: [],
      },
      {
        id: '1e511220-3240-11ef-aa09-000000000000',
        excludedValues: [],
        boosted: [],
      },
      {
        id: 'f04094a0-563e-11ef-a364-000000000000',
        excludedValues: [
          '£50.00',
          '£500.00',
          '£60.00',
          '£70.00',
          '£80.00',
          '£90.00',
        ],
        boosted: ['Tiny', 'Newborn', '1 Months', '0-3 Months'],
      },
    ];
    const mockRuleset: ReturnedCategoryRuleSet = {
      id: mockId,
      categoriesInfo: [
        {
          id: 'foo00',
        },
      ],
      countryCode: 'UK',
      isEnabled: true,
      lastChanged: {
        user: 'user',
        date: '2021-01-01',
      },
      facets: mockFacets,
      excludedFacets: {},
      rules: mockMerchandisingRules,
      startDate: '2024-11-15T23:59:00.000Z',
      endDate: '2024-11-15T23:59:00.000Z',
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

    renderWithProviders(<FacetManagementPage />);

    await user.click((await screen.findAllByTitle('More options'))[0]);
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Create a duplicate rule' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Duplicate rule',
    });
    await user.click(confirmButton);
    expect(createRuleset).toHaveBeenCalledWith({
      rules: mockRuleset.rules,
      facets: mockFacets,
      excludedFacets: {},
      categoryIds: ['foo00'],
      countryCode: 'UK',
      isEnabled: false,
      startDate: '2024-11-15T23:59:00.000Z',
      endDate: '2024-11-15T23:59:00.000Z',
    });

    expect(mockPush).toHaveBeenCalledWith(
      `/category/facets/edit/${mockNewRuleset}`
    );
  });

  it('displays schedule if a ruleset has a start and end date', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockFacets = [
      {
        id: '4f8d4802-3eb0-11ef-9a6a-000000000000',
        excludedValues: [],
        boosted: [],
      },
      {
        id: '1e511220-3240-11ef-aa09-000000000000',
        excludedValues: [],
        boosted: [],
      },
      {
        id: 'f04094a0-563e-11ef-a364-000000000000',
        excludedValues: [
          '£50.00',
          '£500.00',
          '£60.00',
          '£70.00',
          '£80.00',
          '£90.00',
        ],
        boosted: ['Tiny', 'Newborn', '1 Months', '0-3 Months'],
      },
    ];
    const mockRuleset = {
      id: mockId,
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
      facets: mockFacets,
      rules: mockMerchandisingRules,
    };
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        mockRuleset,
        {
          ...mockRuleset,
          id: 'foo',
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-15T10:02:38.556Z',
        },
      ],
      pagination: {
        totalItems: 2,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      globalRuleSets: [],
      error: '',
      isLoading: false,
    });
    renderWithProviders(<FacetManagementPage />);

    expect(await screen.findByRole('time')).toHaveTextContent(
      '14 Oct 2024 - 15 Oct 2024'
    );
  });

  it('should add an empty facet array to a duplicated ruleset which does not have any set', async () => {
    const user = userEvent.setup();
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockRuleset: ReturnedCategoryRuleSet = {
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

    renderWithProviders(<FacetManagementPage />);

    await user.click((await screen.findAllByTitle('More options'))[0]);
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Create a duplicate rule' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Duplicate rule',
    });
    await user.click(confirmButton);
    expect(createRuleset).toHaveBeenCalledWith({
      rules: mockRuleset.rules,
      facets: [],
      isEnabled: false,
      categoryIds: ['catId'],
    });

    expect(mockPush).toHaveBeenCalledWith(
      `/category/facets/edit/${mockNewRuleset}`
    );
  });

  describe('Error messaging', () => {
    it('should display an error message when fetching rulesets fails', async () => {
      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [],
        globalRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        refetchRuleSetList: () => jest.fn,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: 'Error fetching ruleset',
        isLoading: false,
      });

      renderWithProviders(<FacetManagementPage />);

      expect(
        await screen.findByText(
          'Error whilst retrieving ruleset: "Error Error fetching ruleset 500"'
        )
      ).toBeVisible();
    });

    it('should display an error message when deleting a ruleset fails', async () => {
      const mockId = 'ewfw-e3f23-f23f2-3cwef3';
      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [
          {
            id: mockId,
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
          },
        ],
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
      mockRuleSetDelete.error = 'Error deleting ruleset';

      const user = userEvent.setup();
      renderWithProviders(<FacetManagementPage />);

      await user.click((await screen.findAllByTitle('More options'))[0]);
      await user.click(screen.getAllByText('Delete')[0]);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Do you want to delete this rule?',
          })
        ).toBeVisible();
      });

      await user.click(screen.getByLabelText('Delete rule'));

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error whilst deleting ruleset: "Error Error deleting ruleset 500"'
          )
        ).toBeVisible();
      });
    });

    it('should display an error when updating a ruleset fails', async () => {
      const mockId = 'ewfw-e3f23-f23f2-3cwef3';

      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [
          {
            categoriesInfo: [
              {
                id: 'foo00',
              },
            ],
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
        globalRuleSets: [],
        refetchRuleSetList: () => jest.fn,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      mockUpdateRuleSet.error = 'Error updating ruleset';

      renderWithProviders(<FacetManagementPage />);

      const rulesetToggle = await screen.findAllByTitle('Toggle');

      await userEvent.click(rulesetToggle[0]);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error whilst updating ruleset: "Error Error updating ruleset 500"'
          )
        ).toBeVisible();
      });
    });
  });

  it('should display country flag and filter', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          id: '1234',
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
          countryCode: 'IE',
        },
      ],
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

    renderWithProviders(<FacetManagementPage />);

    expect(await screen.findByAltText('IE rule')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'All marksandspencer.com' })
    ).toBeVisible();
  });

  it('should refetch the ruleset list when the country is changed', async () => {
    const user = userEvent.setup();
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
