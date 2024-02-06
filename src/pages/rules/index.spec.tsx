import { act } from 'react-dom/test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ReturnedRuleSet } from '../../libs/api';

import { useRuleSet } from '@/libs/hooks';
import { default as RuleSets } from './index.page';

process.env.DEBUG_PRINT_LIMIT = '1000000';

jest.mock('../../hooks/use-rule-set', () => ({
  useRuleSet: jest.fn(),
}));

const mockRuleSetDelete = jest.fn();
jest.mock('../../hooks/use-rule-set-delete', () => ({
  useRuleSetDelete: () => {
    return { handleDelete: mockRuleSetDelete };
  },
}));

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
    });
    render(<RuleSets />);

    expect(screen.getByText('Category ranking rules')).toBeVisible();
  });

  it('should open and close sizes menu', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
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

    const label = await screen.findByText('100');

    expect(label).toBeVisible();

    act(() => {
      dropdown.click();
    });

    expect(await screen.findByText('100')).not.toBeVisible();
  });

  it('should open select item and change page size', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
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

    const label = await screen.findByText('100');

    expect(label).toBeVisible();

    act(() => {
      label.click();
    });

    expect(dropdown.previousSibling?.textContent).toBe('100');
  });

  it('should change current page', () => {
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: Array.from({ length: 97 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoryId: `${i}`,
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        },
      })),
      pagination: {
        totalItems: 97,
      },
      refetchRuleSetList: () => jest.fn,
    });

    const { container } = render(<RuleSets />);
    const text = 'Page 1 of 10';

    expect(screen.getByText(text)).toBeVisible();

    const nextPageButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Next page"]'
    );

    if (!nextPageButton) {
      throw new Error('Next page button not found');
    }

    act(() => {
      nextPageButton.click();
    });

    const newText = 'Page 2 of 10';
    expect(screen.getByText(newText)).toBeVisible();

    const prevPageButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous page"]'
    );

    if (!prevPageButton) {
      throw new Error('Prev page button not found');
    }

    act(() => {
      prevPageButton.click();
    });

    expect(screen.getByText(text)).toBeVisible();
  });

  it('should change page to 1 when there is no items on current page due to page sizes change', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: Array.from({ length: 13 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoryId: `${i}`,
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        },
      })),
      pagination: {
        totalItems: 13,
      },
      refetchRuleSetList: () => jest.fn,
    });
    const { container } = render(<RuleSets />);
    const text = 'Page 1 of 2';

    expect(screen.getByText(text)).toBeVisible();

    const nextPageButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Next page"]'
    );

    if (!nextPageButton) {
      throw new Error('Next page button not found');
    }

    act(() => {
      nextPageButton.click();
    });

    const newText = 'Page 2 of 2';
    expect(await screen.findByText(newText)).toBeVisible();

    const dropdown = container.querySelector<HTMLElement>(
      'span[name="ChevronDownDefault"]'
    );

    if (!dropdown) {
      throw new Error('Dropdown not found');
    }

    act(() => {
      dropdown.click();
    });

    const label = await screen.findByText('100');

    expect(label).toBeVisible();

    act(() => {
      label.click();
    });

    const newTextAfterSizesChange = 'Page 1 of 1';

    expect(await screen.findByText(newTextAfterSizesChange)).toBeVisible();
  });

  it('should not change page to 1 when there are still items on current page due to page sizes change', async () => {
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
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        },
      })),
      pagination: {
        totalItems: 80,
      },
      refetchRuleSetList: () => jest.fn,
    });
    const { container } = render(<RuleSets />);
    const text = 'Page 1 of 8';

    expect(screen.getByText(text)).toBeVisible();

    const nextPageButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Next page"]'
    );

    if (!nextPageButton) {
      throw new Error('Next page button not found');
    }

    act(() => {
      nextPageButton.click();
    });

    const newText = 'Page 2 of 8';
    expect(await screen.findByText(newText)).toBeVisible();

    const dropdown = container.querySelector<HTMLElement>(
      'span[name="ChevronDownDefault"]'
    );

    if (!dropdown) {
      throw new Error('Dropdown not found');
    }

    act(() => {
      dropdown.click();
    });

    await waitFor(() => {
      expect(screen.queryByText('20')).toBeVisible();
    });

    const label = await screen.findByText('20');

    act(() => {
      label.click();
    });

    const newTextAfterSizesChange = 'Page 2 of 4';

    expect(await screen.findByText(newTextAfterSizesChange)).toBeVisible();
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
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        },
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
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: [],
      },
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
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: [],
      },
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
    });
    render(<RuleSets />);

    expect(await screen.findByText('0 | identifier-00')).toBeVisible();

    expect(jest.mocked(useRuleSet)).toHaveBeenCalledWith('', 0, 10);
    await waitFor(() => {
      expect(screen.queryByText('identifier-20')).toBeNull();
    });

    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: ruleSet
        .sort((a, b) => (a.categoryId < b.categoryId ? 1 : -1))
        .slice(0, 10),
      pagination: {
        totalItems: 23,
      },
      refetchRuleSetList: () => jest.fn,
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
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        },
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
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: [],
      },
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
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: [],
      },
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
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        },
      })),
      pagination: {
        totalItems: undefined,
      },
      refetchRuleSetList: () => jest.fn,
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
    jest.mocked(useRuleSet).mockReturnValue({
      ruleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
    });

    render(<RuleSets />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await userEvent.type(search, 'test');

    expect(useRuleSet).toHaveBeenCalledWith('test', 0, 10);
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
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: [],
          },
        },
      ],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
    });

    render(<RuleSets />);

    const rulesetDropdown = screen.getAllByTitle('More options');

    await userEvent.click(rulesetDropdown[0]);

    const rulesetDelete = screen.getByText('Delete');

    await userEvent.click(rulesetDelete);

    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
  });
});
