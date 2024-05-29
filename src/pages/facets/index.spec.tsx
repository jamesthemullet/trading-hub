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
        setRuleSets: jest.fn(),
        facets: [],
      })),
      pagination: {
        totalItems: 80,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });
    renderWithProviders(<FacetManagementPage />);

    expect(screen.getByText('Category Facet Management')).toBeVisible();
    expect(screen.getByText('Add facet')).toBeVisible();
    expect(screen.getByText('1 | identifier-1')).toBeVisible();
  });

  it('should open delete modal and close on cancel', async () => {
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
        },
      ],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setRuleSets: jest.fn(),
    });

    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(screen.getByText('Delete facet rule?')).toBeVisible();
    });

    await user.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.getByText('Delete facet rule?')).not.toBeVisible();
    });

    await user.click(screen.getAllByTitle('More options')[0]);
    await user.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(screen.getByLabelText('delete-facet')).toBeVisible();
    });

    await user.click(screen.getByLabelText('delete-facet'));
    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
  });
});
