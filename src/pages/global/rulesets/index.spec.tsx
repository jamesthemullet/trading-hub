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
jest.mock('../../../libs/hooks/use-rule-set-delete', () => ({
  useRuleSetDelete: () => {
    return { handleDelete: mockRuleSetDelete };
  },
}));

const mockUpdateRuleSet = jest.fn();
jest.mock('../../../libs/hooks/use-rule-set-update', () => ({
  useUpdateRuleSet: () => {
    return { updateRuleSet: mockUpdateRuleSet, isSaving: true };
  },
}));

const NEW_RULE_BUTTON_TEXT = 'Add rule';

const mockMerchangdisingRules = {
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
        rules: mockMerchangdisingRules,
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
});
