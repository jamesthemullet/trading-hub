import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { ReturnedCategoryRuleSet } from '@/libs/api';
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { useRuleSet, useRuleSetCreate } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

process.env.DEBUG_PRINT_LIMIT = '1000000';

const mockRuleSetDelete = jest.fn();
const mockUpdateRuleSet = jest.fn();
jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSetCreate: jest.fn(),
  useRuleSet: jest.fn(),
  useRuleSetDelete: () => {
    return { handleDelete: mockRuleSetDelete };
  },
  useUpdateRuleSet: () => {
    return { updateCategoryRuleSet: mockUpdateRuleSet, isSaving: true };
  },
}));
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

describe('Index', () => {
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

    expect(screen.getByText('Category ranking rules')).toBeVisible();
  });

  it('should update correctly if the totalItems is undefined', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoryIds: [`category${i}`],
        categoriesInfo: [
          {
            id: `category${i}`,
          },
        ],
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: mockMerchandisingRules,
        facets: [],
      })),
      pagination: {
        totalItems: undefined,
      },
      globalRuleSets: [],
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });
    const { container } = renderWithProviders(<RuleSets />);

    const dropdown = container.querySelector<HTMLElement>(
      'span[name="ChevronDownDefault"]'
    );

    if (!dropdown) {
      throw new Error('Dropdown not found');
    }

    act(() => {
      dropdown.click();
    });

    const valueToClick = await screen.findByText('100');
    act(() => {
      valueToClick.click();
    });

    expect(dropdown.previousSibling?.textContent).toBe('100');
  });

  it('displays schedule if a ruleset has a start and end date', () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          categoryName: `identifier-1`,
          id: `1`,
          categoryIds: [`1`],
          categoriesInfo: [
            {
              id: `1`,
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
          categoryName: `identifier-2`,
          id: `2`,
          categoryIds: [`2`],
          categoriesInfo: [
            {
              id: `2`,
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
    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasScheduling: true, hasIreland: false }}
      >
        <RuleSets />
      </FeatureFlagContext.Provider>
    );

    expect(screen.getByRole('time')).toHaveTextContent(
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
      expect(useRuleSet).toHaveBeenCalledWith(
        'search-search',
        0,
        10,
        'category'
      )
    );
  });

  it('should delete a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          categoryName: 'cat name',
          id: mockId,
          categoryIds: ['catId'],
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

    const rulesetDropdown = screen.getAllByTitle('More options');

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

    await user.click(screen.getByLabelText('Delete rule'));
    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
  });

  it('should enable or disable a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockCatId = 'catId';
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          categoryName: 'cat id',
          countryCode: 'UK',
          id: mockId,
          categoriesInfo: [
            {
              id: mockCatId,
            },
          ],
          categoryIds: [mockCatId],
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
          categoryName: 'cat id 2',
          id: 'ewfw-e3f23-f23f2-3cwef4',
          categoryIds: ['catId2'],
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

    const rulesetToggle = screen.getAllByTitle('Toggle');

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
          categoryName: 'cat id',
          id: mockId,
          categoryIds: [mockCatId],
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
          categoryName: 'cat id 2',
          id: 'ewfw-e3f23-f23f2-3cwef4',
          categoryIds: ['catId2'],
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

    const rulesetToggle = screen.getAllByTitle('Toggle');

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
    const mockRuleset: ReturnedCategoryRuleSet = {
      categoryName: 'cat name',
      id: mockId,
      countryCode: 'UK',
      categoriesInfo: [
        {
          id: 'foo00',
        },
      ],
      categoryIds: ['catId'],
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
      rules: mockRuleset.rules,
      facets: [],
      excludedFacets: { facets: [] },
      categoryIds: mockRuleset.categoryIds,
      isEnabled: false,
      startDate: '2024-09-12T14:17:54Z',
      endDate: '2024-12-19T04:20:03Z',
      countryCode: 'UK',
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
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

    expect(await screen.findByText('Error: Failed to fetch')).toBeVisible();
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

    expect(screen.queryAllByText('Add new rule')).toHaveLength(0);

    expect(screen.getByLabelText('datatable-skeleton')).toBeVisible();
    expect(screen.getByLabelText('table-pagination-skeleton')).toBeVisible();
  });

  it('should show country flag if Ireland feature flag is enabled', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          categoryName: 'cat id',
          id: 'ewfw-e3f23-f23f2-3cwef3',
          categoryId: 'catId',
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

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasScheduling: false, hasIreland: true }}
      >
        <RuleSets />
      </FeatureFlagContext.Provider>
    );

    expect(screen.getByAltText('IE rule')).toBeVisible();
  });

  it('should not show country flag if Ireland feature flag is not enabled', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      categoryRuleSets: [
        {
          categoryName: 'cat id',
          id: 'ewfw-e3f23-f23f2-3cwef3',
          categoryId: 'catId',
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

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasScheduling: false, hasIreland: false }}
      >
        <RuleSets />
      </FeatureFlagContext.Provider>
    );

    expect(screen.queryByAltText('IE rule')).not.toBeInTheDocument();
  });
});
