import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSearchRulesetList } from '@/libs/hooks';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

jest.mock('../../../libs/hooks/search/use-search-ruleset-list', () => ({
  useSearchRulesetList: jest.fn(),
}));

const mockUpdateRuleSet = jest.fn();
jest.mock('../../../libs/hooks/search/use-search-ruleset-update', () => ({
  useSearchRuleSetUpdate: () => {
    return { updateRuleSet: mockUpdateRuleSet, isSaving: true };
  },
}));

describe('Search Rulesets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('displays the list of rules', () => {
    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [],
      pagination: {
        totalItems: 0,
      },
      error: '',
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    renderWithProviders(<RuleSets />);

    expect(
      screen.getByRole('heading', { name: 'Search ranking rules', level: 2 })
    ).toBeVisible();
  });

  it('should search', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];
    const user = userEvent.setup();
    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
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
      error: '',
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    renderWithProviders(<RuleSets />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await user.type(search, mockSearchTerms[0]);

    await waitFor(() =>
      expect(useSearchRulesetList).toHaveBeenCalledWith(
        mockSearchTerms[0],
        0,
        10
      )
    );
  });

  it('should enable or disable a ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    const mockSearchTerms = ['search', 'terms'];

    jest.mocked(useSearchRulesetList).mockReturnValue({
      ruleSets: [
        {
          searchTerms: mockSearchTerms,
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
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(<RuleSets />);

    const rulesetToggle = screen.getAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      searchTerms: mockSearchTerms,
      ruleSetId: mockId,
      rules: {
        facets: [],
        isEnabled: false,
        rules: mockMerchandisingRules,
      },
    });
  });
});
