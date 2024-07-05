import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetFacetAttributeValues, useRuleSet } from '@/libs/hooks';
import { attributeValuesMock } from '@/pages/api/merchandising/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as FacetManagementPage } from './index.page';

const mockRuleSetDelete = jest.fn();
const mockUpdateGlobalRuleSet = jest.fn();

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSet: jest.fn(),
  useGetFacetAttributeValues: jest.fn(),
  useGlobalRuleSetDelete: () => {
    return { handleDelete: mockRuleSetDelete };
  },
}));

jest.mock('@/libs/hooks/global/rulesets/use-global-rule-set-update', () => ({
  useGlobalRuleSetUpdate: () => {
    return { saveGlobalRuleset: mockUpdateGlobalRuleSet, isSaving: true };
  },
}));

const mockMerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
};

describe('Global Facet Management', () => {
  beforeEach(() => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      pagination: {
        totalItems: 5,
      },
      refetch: jest.fn(),
    });
  });

  it('displays the list of facets', () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    jest.mocked(useRuleSet).mockReturnValue({
      globalRuleSets: [
        {
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
        },
      ],
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setGlobalRuleSets: jest.fn(),
      setCategoryRuleSets: jest.fn(),
    });

    renderWithProviders(<FacetManagementPage />);

    expect(screen.getByText('*')).toBeVisible();
  });

  it('should open delete modal and close on cancel', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    jest.mocked(useRuleSet).mockReturnValue({
      globalRuleSets: [
        {
          id: mockId,
          isEnabled: true,
          lastChanged: {
            user: 'user',
            date: '2021-01-01',
          },
          rules: mockMerchandisingRules,
        },
      ],
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setGlobalRuleSets: jest.fn(),
      setCategoryRuleSets: jest.fn(),
    });

    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

    const search = screen.queryByPlaceholderText(/Search\.\.\./i);

    if (!search) {
      throw new Error('Search not found');
    }

    await user.type(search, 'search-search');

    await waitFor(() =>
      expect(useRuleSet).toHaveBeenCalledWith('search-search', 0, 10, 'global')
    );
  });

  it('should enable or disable a global ruleset', async () => {
    const mockId = 'ewfw-e3f23-f23f2-3cwef3';
    jest.mocked(useRuleSet).mockReturnValue({
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
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
    });

    renderWithProviders(<FacetManagementPage />);

    const rulesetToggle = screen.getAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith({
      ruleSetId: mockId,
      ruleSet: {
        facets: [],
        isEnabled: false,
        rules: mockMerchandisingRules,
      },
    });
  });

  it('should delete a ruleset', async () => {
    const mockId = 'fdq3r3-123d3-f32f23f-23r2';
    const user = userEvent.setup();
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

    renderWithProviders(<FacetManagementPage />);

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
  });
});
