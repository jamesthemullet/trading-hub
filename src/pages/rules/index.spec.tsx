import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useRuleSet } from '@/libs/hooks';

import type { ReturnedRuleSet } from '../../libs/api';
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
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays the list of rules', () => {
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    render(<RuleSets />);

    expect(screen.getByText('Category ranking rules')).toBeVisible();
  });

  it('should sort the rules by identifier', async () => {
    const rulrankingRules: ReturnedRuleSet[] = Array.from(
      { length: 21 },
      (_, i) => ({
        categoryName: `identifier-${i.toString().padStart(2, '0')}`,
        categoryId: `${i}`,
        id: `${i}`,
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: mockMerchangdisingRules,
        facets: [],
      })
    );
    const oneExtraRankingRuleOutOfOrder: ReturnedRuleSet = {
      categoryName: '_identifier-22',
      categoryId: '22',
      id: '22',
      isEnabled: true,
      lastChanged: {
        user: 'user',
        date: '2020-01-01T13:00:00.000Z',
      },
      rules: mockMerchangdisingRules,
      facets: [],
    };

    const oneExtraRankingRuleWithSameIdentifier: ReturnedRuleSet = {
      categoryName: '_identifier-22',
      categoryId: '23',
      id: '23',
      isEnabled: true,
      lastChanged: {
        user: 'user',
        date: '2020-01-01T13:00:00.000Z',
      },
      rules: mockMerchangdisingRules,
      facets: [],
    };

    const ruleSet: ReturnedRuleSet[] = [
      ...rulrankingRules,
      oneExtraRankingRuleOutOfOrder,
      oneExtraRankingRuleWithSameIdentifier,
    ];

    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: ruleSet.slice(0, 10),
      pagination: {
        totalItems: 23,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    render(<RuleSets />);

    expect(await screen.findByText('0 | identifier-00')).toBeVisible();

    expect(jest.mocked(useRuleSet)).toHaveBeenCalledWith('', 0, 10);
    await waitFor(() => {
      expect(screen.queryByText('identifier-20')).toBeNull();
    });

    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: ruleSet
        .sort((a, b) =>
          a.categoryId && b.categoryId && a.categoryId < b.categoryId ? 1 : -1
        )
        .slice(0, 10),
      pagination: {
        totalItems: 23,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    await act(async () => {
      (await screen.findByText('Identifier')).click();
    });

    expect(await screen.findByText('20 | identifier-20')).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByText('0 | identifier-00')).toBeNull();
    });
  });

  it('should sort the rules by lastChange', async () => {
    const rankingRules: ReturnedRuleSet[] = Array.from(
      { length: 21 },
      (_, i) => ({
        categoryName: `identifier-${i.toString().padStart(2, '0')}`,
        categoryId: `${i}`,
        id: `${i}`,
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: `2021-01-${(i + 1).toString().padStart(2, '0')}T13:00:00.000Z`,
        },
        rules: mockMerchangdisingRules,
        facets: [],
      })
    );
    const oneExtraRankingRuleOutOfOrder: ReturnedRuleSet = {
      categoryName: 'identifier-22',
      categoryId: '22',
      id: '22',
      isEnabled: true,
      lastChanged: {
        user: 'user',
        date: '2020-01-01T13:00:00.000Z',
      },
      rules: mockMerchangdisingRules,
      facets: [],
    };

    const oneExtraRankingRuleWithSameTime: ReturnedRuleSet = {
      categoryName: 'identifier-23',
      categoryId: '23',
      id: '23',
      isEnabled: true,
      lastChanged: {
        user: 'user',
        date: '2020-01-01T13:00:00.000Z',
      },
      rules: mockMerchangdisingRules,
      facets: [],
    };
    const ruleSets: ReturnedRuleSet[] = [
      ...rankingRules,
      oneExtraRankingRuleOutOfOrder,
      oneExtraRankingRuleWithSameTime,
    ];

    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: ruleSets.slice(0, 10),
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    render(<RuleSets />);

    await waitFor(() => {
      expect(screen.queryByText('Jan 21, 2021')).toBeNull();
    });
    expect(await screen.findAllByText('Jan 01, 2021')).not.toHaveLength(0);

    const lastChangedLabel = await screen.findByText('Last changed');

    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: ruleSets
        .sort((a, b) =>
          new Date(a.lastChanged.date).getTime() <
          new Date(b.lastChanged.date).getTime()
            ? 1
            : -1
        )
        .slice(0, 10),
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    act(() => {
      // now it's sorted by asc by identifier
      lastChangedLabel.click();
      // now it's sorted by asc by last change
    });

    act(() => {
      lastChangedLabel.click();
      // now it's sorted by desc by last change
    });

    act(() => {
      lastChangedLabel.click();
      // now it's sorted by asc by last change
    });

    expect(await screen.findAllByText('Jan 21, 2021')).not.toHaveLength(0);
    await waitFor(() => {
      expect(screen.queryByText('Jan 32, 2021')).toBeNull();
    });
  });

  it('should update correctly if the totalItems is undefined', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: Array.from({ length: 80 }, (_, i) => ({
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
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    const { container } = render(<RuleSets />);

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
      ruleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    render(<RuleSets />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await user.type(search, 'search-search');

    await waitFor(() =>
      expect(useRuleSet).toHaveBeenCalledWith('search-search', 0, 10)
    );
  });

  it('should delete a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: [
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
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    render(<RuleSets />);

    const rulesetDropdown = screen.getAllByTitle('More options');

    await userEvent.click(rulesetDropdown[0]);

    const rulesetDelete = screen.getByText('Delete');

    await userEvent.click(rulesetDelete);

    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
  });

  it('should enable or disable a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockCatId = 'catId';
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: [
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
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    render(<RuleSets />);

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
