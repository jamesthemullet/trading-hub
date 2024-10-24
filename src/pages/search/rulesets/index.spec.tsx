import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { useSearchRulesetList } from '@/libs/hooks';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as RuleSets } from './index.page';

const mockNewRuleset = 'foo123';
const mockUpdateRuleSet = jest.fn();
const mockRuleSetDelete = jest.fn();
const mockRuleSetCreate = jest.fn().mockResolvedValue({ id: mockNewRuleset });
jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useSearchRulesetList: jest.fn(),
  useSearchRuleSetUpdate: () => {
    return { updateRuleSet: mockUpdateRuleSet, isSaving: true };
  },
  useSearchRuleSetDelete: () => {
    return { deleteRuleset: mockRuleSetDelete };
  },
  useSearchRuleSetCreate: () => {
    return { createRuleset: mockRuleSetCreate };
  },
}));
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Search Rulesets', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  const mockNewRuleset = 'foo123';

  beforeAll(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

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

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

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

  it('should enable or disable a scheduled ruleset', async () => {
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
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-14T10:02:38.556Z',
        },
      ],
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(
      <FeatureFlagContext.Provider value={{ hasScheduling: true }}>
        <RuleSets />
      </FeatureFlagContext.Provider>
    );

    const rulesetToggle = screen.getAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      searchTerms: mockSearchTerms,
      ruleSetId: mockId,
      rules: {
        facets: [],
        isEnabled: false,
        rules: mockMerchandisingRules,
        startDate: '2024-10-14T10:02:38.556Z',
        endDate: '2024-10-14T10:02:38.556Z',
      },
    });
  });

  it('should duplicate a ruleset', async () => {
    const user = userEvent.setup();
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
    expect(mockRuleSetCreate).toHaveBeenCalledWith({
      merchandisingRules: mockMerchandisingRules,
      searchTerms: mockSearchTerms,
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/search/rulesets/edit/${mockNewRuleset}`
    );
  });

  it('should delete a ruleset', async () => {
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

    const user = userEvent.setup();

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

  it('should display scheduling column if feature flag is enabled', () => {
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
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-14T10:02:38.556Z',
        },
      ],
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(
      <FeatureFlagContext.Provider value={{ hasScheduling: true }}>
        <RuleSets />
      </FeatureFlagContext.Provider>
    );

    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('should not display scheduling column if feature flag is not enabled', () => {
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
          startDate: '2024-10-14T10:02:38.556Z',
          endDate: '2024-10-14T10:02:38.556Z',
        },
      ],
      error: '',
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    renderWithProviders(
      <FeatureFlagContext.Provider value={{ hasScheduling: false }}>
        <RuleSets />
      </FeatureFlagContext.Provider>
    );

    expect(screen.queryByText('Schedule')).not.toBeInTheDocument();
  });
});
