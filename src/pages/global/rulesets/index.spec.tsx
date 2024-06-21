import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGlobalRuleSetCreate, useRuleSet } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

process.env.DEBUG_PRINT_LIMIT = '1000000';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../libs/hooks/use-global-rule-set-create', () => ({
  useGlobalRuleSetCreate: jest.fn(),
}));

jest.mock('../../../libs/hooks/use-rule-set', () => ({
  useRuleSet: jest.fn(),
}));

const mockRuleSetDelete = jest.fn();
jest.mock('../../../libs/hooks/use-global-rule-set-delete', () => ({
  useGlobalRuleSetDelete: () => {
    return { handleDelete: mockRuleSetDelete };
  },
}));

const mockUpdateRuleSet = jest.fn();
jest.mock('../../../libs/hooks/use-global-rule-set-update', () => ({
  useGlobalRuleSetUpdate: () => {
    return { saveGlobalRuleset: mockUpdateRuleSet, isSaving: true };
  },
}));

const NEW_RULE_BUTTON_TEXT = 'Add rule';

const mockMerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
};

const MOCK_CATEGORY_ID = 'Cat123';

const mockRouter = {
  push: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
};

describe('Index', () => {
  beforeAll(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    jest.mocked(useGlobalRuleSetCreate).mockReturnValue({
      createGlobalRuleSet: jest.fn(() =>
        Promise.resolve({
          id: MOCK_CATEGORY_ID,
          isEnabled: false,
          rules: {
            pinnedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            blockedProducts: [],
          },
          lastChanged: {
            date: '12/12/12',
            user: 'me',
          },
        })
      ),
      error: '',
    });
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

    expect(screen.getByText('Global category ranking rules')).toBeVisible();
  });

  it('should update correctly if the totalItems is undefined', async () => {
    jest.mocked(useRuleSet).mockReturnValue({
      globalRuleSets: Array.from({ length: 80 }, (_, i) => ({
        categoryName: `identifier-${i}`,
        id: `${i}`,
        categoryId: `${i}`,
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
      categoryRuleSets: [],
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
      expect(useRuleSet).toHaveBeenCalledWith('search-search', 0, 10, 'global')
    );
  });

  it('creates a new rule set and redirects to the edit page', async () => {
    renderWithProviders(<RuleSets />);

    const createButton = await screen.findByText(NEW_RULE_BUTTON_TEXT);
    act(() => {
      createButton.click();
    });

    await screen.findByText(NEW_RULE_BUTTON_TEXT);

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/global/rulesets/edit/${MOCK_CATEGORY_ID}`
    );
  });

  it('should enable or disable a ruleset', async () => {
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
    });

    renderWithProviders(<RuleSets />);

    const rulesetToggle = screen.getAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      ruleSetId: mockId,
      ruleSet: {
        isEnabled: false,
        facets: [],
        rules: mockMerchandisingRules,
      },
    });
  });

  it('should delete a ruleset', async () => {
    const mockId = 'fdq3r3-123d3-f32f23f-23r2';
    const user = userEvent.setup();
    const mockRefectRulesList = jest.fn();

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
      refetchRuleSetList: mockRefectRulesList,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
    });

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

    await user.click(deleteButton);
    await waitFor(() => {
      expect(
        screen.getByText('Do you want to delete this rule?')
      ).toBeVisible();
    });
    await user.click(screen.getByLabelText('Delete rule'));

    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
    expect(mockRefectRulesList).toHaveBeenCalled();
  });
});
