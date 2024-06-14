import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useRuleSet } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

process.env.DEBUG_PRINT_LIMIT = '1000000';

jest.mock('../../libs/hooks/use-rule-set', () => ({
  useRuleSet: jest.fn(),
}));

const mockRuleSetDelete = jest.fn();
jest.mock('../../libs/hooks/use-rule-set-delete', () => ({
  useRuleSetDelete: () => {
    return { handleDelete: mockRuleSetDelete };
  },
}));

const mockUpdateRuleSet = jest.fn();
jest.mock('../../libs/hooks/use-rule-set-update', () => ({
  useUpdateRuleSet: () => {
    return { updateRuleSet: mockUpdateRuleSet, isSaving: true };
  },
}));

const mockMerchangdisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
};

describe('Index', () => {
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
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: mockMerchangdisingRules,
        facets: [],
      })),
      pagination: {
        totalItems: undefined,
      },
      globalRuleSets: [],
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
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
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchangdisingRules,
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
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchangdisingRules,
          facets: [],
        },
        {
          categoryName: 'cat id 2',
          id: 'ewfw-e3f23-f23f2-3cwef4',
          categoryId: 'catId2',
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchangdisingRules,
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
    });

    renderWithProviders(<RuleSets />);

    const rulesetToggle = screen.getAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      categoryId: mockCatId,
      facets: [],
      id: mockId,
      isEnabled: false,
      merchandisingRules: mockMerchangdisingRules,
    });
  });
});
