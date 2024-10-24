import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { ReturnedCategoryRuleSet } from '@/libs/api';
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { useRuleSet, useRuleSetCreate } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as FacetManagementPage } from './index.page';

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSetCreate: jest.fn(),
  useRuleSet: jest.fn(),
}));
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
const handleDeleteMock = jest.fn();
const mockRuleSetDelete = {
  handleDelete: handleDeleteMock,
  error: '',
};
jest.mock('../../../libs/hooks/use-rule-set-delete', () => ({
  useRuleSetDelete: () => {
    return mockRuleSetDelete;
  },
}));

const handleUpdateMock = jest.fn();
const mockUpdateRuleSet = {
  updateRuleSet: handleUpdateMock,
  isSaving: false,
  error: '',
};

jest.mock('../../../libs/hooks/use-rule-set-update', () => ({
  useUpdateRuleSet: () => {
    return mockUpdateRuleSet;
  },
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

describe('Category facet management', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  const mockNewRuleset = 'foo123';
  const createRuleset = jest.fn().mockResolvedValue({ id: mockNewRuleset });

  beforeAll(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.mocked(useRuleSetCreate).mockReturnValue({
      createRuleset,
      error: '',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('displays the list of rules', () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoriesInfo: [
          {
            id: 'foo00',
          },
        ],
        categoryId: `${i}`,
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

    expect(screen.getByText('Category Facet Management')).toBeVisible();
    expect(screen.getByText('Add new facet')).toBeVisible();
    expect(screen.getByText('1 | identifier-1')).toBeVisible();
  });

  it('should open delete modal and close on cancel', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          categoryName: 'cat name',
          id: mockId,
          categoriesInfo: [
            {
              id: 'foo00',
            },
          ],
          categoryId: 'catId',
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

    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(
        screen.getByText('Do you want to delete this rule?')
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
      expect(useRuleSet).toHaveBeenCalledWith(
        'search-search',
        0,
        10,
        'category'
      )
    );
  });

  it('should go back to the first page after the user has searched', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [],
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

    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

    expect(screen.getByText('Page 1 of 8')).toBeVisible();

    const nextPageButton = screen.getByLabelText('Next page');

    await user.click(nextPageButton);
    await user.click(nextPageButton);
    await user.click(nextPageButton);

    expect(screen.getByText('Page 4 of 8')).toBeVisible();

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

    await user.type(search, 'search-search');

    await waitFor(() =>
      expect(useRuleSet).toHaveBeenCalledWith(
        'search-search',
        0,
        10,
        'category'
      )
    );

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 8')).toBeVisible();
    });
  });

  it('should enable or disable a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockCatId = 'catId';
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          categoryName: 'cat id',
          categoriesInfo: [
            {
              id: 'foo00',
            },
          ],
          id: mockId,
          categoryId: mockCatId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
          facets: [],
        },
        {
          categoryName: 'cat id 2',
          id: 'ewfw-e3f23-f23f2-3cwef4',
          categoriesInfo: [
            {
              id: 'foo00',
            },
          ],
          categoryId: 'catId2',
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

    const rulesetToggle = screen.getAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(handleUpdateMock).toHaveBeenCalledWith({
      categoryId: mockCatId,
      ruleSetId: mockId,
      rules: {
        facets: [],
        rules: mockMerchandisingRules,
        isEnabled: false,
      },
    });
  });

  it('should have loading state', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoriesInfo: [
          {
            id: 'foo00',
          },
        ],
        categoryId: `${i}`,
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

    expect(screen.queryAllByText('Add new facet')).toHaveLength(0);

    expect(screen.getByLabelText('datatable-skeleton')).toBeVisible();
    expect(
      screen.getByLabelText('table-pagination-skeleton')
    ).toBeInTheDocument();
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
    const mockRuleset = {
      categoryName: 'cat name',
      id: mockId,
      categoriesInfo: [
        {
          id: 'foo00',
        },
      ],
      categoryId: 'catId',
      isEnabled: true,
      lastChanged: {
        user: 'user',
        date: '2021-01-01',
      },
      facets: mockFacets,
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

    await user.click(screen.getAllByTitle('More options')[0]);
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
      merchandisingRules: mockRuleset.rules,
      facets: mockFacets,
      categoryId: mockRuleset.categoryId,
      isEnabled: false,
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/category/facets/edit/${mockNewRuleset}`
    );
  });

  it('displays schedule if a ruleset has a start and end date', () => {
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
      categoryName: 'cat name',
      id: mockId,
      categoriesInfo: [
        {
          id: 'foo00',
        },
      ],
      categoryId: 'catId',
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
    renderWithProviders(
      <FeatureFlagContext.Provider value={{ hasScheduling: true }}>
        <FacetManagementPage />
      </FeatureFlagContext.Provider>
    );

    expect(screen.getByRole('time')).toHaveTextContent(
      '14 Oct 2024 - 15 Oct 2024'
    );
  });

  it('should add an empty facet array to a duplicated ruleset which does not have any set', async () => {
    const user = userEvent.setup();
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockRuleset: ReturnedCategoryRuleSet = {
      categoryName: 'cat name',
      id: mockId,
      categoriesInfo: [
        {
          id: 'foo00',
        },
      ],
      categoryId: 'catId',
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

    await user.click(screen.getAllByTitle('More options')[0]);
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
      merchandisingRules: mockRuleset.rules,
      facets: [],
      isEnabled: false,
      categoryId: mockRuleset.categoryId,
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/category/facets/edit/${mockNewRuleset}`
    );
  });

  describe('Error messaging', () => {
    it('should display an error message when fetching rulesets fails', () => {
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
        screen.getByText(
          'Error whilst retrieving ruleset: Error fetching ruleset'
        )
      ).toBeVisible();
    });

    it('should display an error message when deleting a ruleset fails', async () => {
      const mockId = 'ewfw-e3f23-f23f2-3cwef3';
      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [
          {
            categoryName: 'cat name',
            id: mockId,
            categoriesInfo: [
              {
                id: 'foo00',
              },
            ],
            categoryId: 'catId',
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

      renderWithProviders(<FacetManagementPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error whilst deleting ruleset: Error deleting ruleset'
          )
        ).toBeVisible();
      });
    });

    it('should display an error when updating a ruleset fails', async () => {
      const mockId = 'ewfw-e3f23-f23f2-3cwef3';
      const mockCatId = 'catId';
      jest.mocked(useRuleSet).mockReturnValue({
        categoryRuleSets: [
          {
            categoryName: 'cat id',
            categoriesInfo: [
              {
                id: 'foo00',
              },
            ],
            id: mockId,
            categoryId: mockCatId,
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

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error whilst updating ruleset: Error updating ruleset'
          )
        ).toBeVisible();
      });
    });
  });
});
