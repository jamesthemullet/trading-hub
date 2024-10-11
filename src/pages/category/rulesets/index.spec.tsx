import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

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
    return { updateRuleSet: mockUpdateRuleSet, isSaving: true };
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
  const handlePost = jest.fn().mockResolvedValue({ id: mockNewRuleset });

  beforeAll(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.mocked(useRuleSetCreate).mockReturnValue({
      handlePost,
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
        categoryId: `${i}`,
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

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

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

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);
    await waitFor(() => {
      expect(
        screen.getByText('Do you want to delete this rule?')
      ).toBeVisible();
    });

    await user.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(
        screen.getByText('Do you want to delete this rule?')
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
          id: mockId,
          categoryId: mockCatId,
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
        },
        {
          categoryName: 'cat id 2',
          id: 'ewfw-e3f23-f23f2-3cwef4',
          categoryId: 'catId2',
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
      categoryId: mockCatId,
      ruleSetId: mockId,
      rules: {
        facets: [],
        isEnabled: false,
        rules: mockMerchandisingRules,
      },
    });
  });

  it('should duplicate a ruleset', async () => {
    const user = userEvent.setup();
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
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
    expect(handlePost).toHaveBeenCalledWith({
      merchandisingRules: mockRuleset.rules,
      facets: [],
      categoryId: mockRuleset.categoryId,
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
});
