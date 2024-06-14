import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useRuleSet } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as FacetManagementPage } from './index.page';

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

describe('Category facet management', () => {
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
        categoryId: `${i}`,
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: mockMerchangdisingRules,
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
    });
    renderWithProviders(<FacetManagementPage />);

    expect(screen.getByText('Category Facet Management')).toBeVisible();
    expect(screen.getByText('Add facet')).toBeVisible();
    expect(screen.getByText('1 | identifier-1')).toBeVisible();
  });

  it('should open delete modal and close on cancel', async () => {
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
        },
      ],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      globalRuleSets: [],
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
    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
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
    });

    renderWithProviders(<FacetManagementPage />);

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
      pagination: {
        totalItems: 0,
      },
      globalRuleSets: [],
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
    });

    renderWithProviders(<FacetManagementPage />);

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
