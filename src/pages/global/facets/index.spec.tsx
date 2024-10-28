import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import {
  useGetFacetAttributeValues,
  useGlobalRuleSetCreate,
  useRuleSet,
} from '@/libs/hooks';
import { attributeValuesMock } from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import { default as FacetManagementPage } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock(
  '../../../libs/hooks/global/rulesets/use-global-rule-set-create',
  () => ({
    useGlobalRuleSetCreate: jest.fn(),
  })
);

const mockRuleSetDelete = jest.fn();
const mockUpdateGlobalRuleSet = jest.fn();
const updateGlobalRuleSet = {
  saveGlobalRuleset: mockUpdateGlobalRuleSet,
  error: '',
  isSaving: true,
};
const deleteGlobalRuleSet = {
  handleDelete: mockRuleSetDelete,
  error: '',
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useRuleSet: jest.fn(),
  useGetFacetAttributeValues: jest.fn(),
  useGlobalRuleSetDelete: () => {
    return deleteGlobalRuleSet;
  },
}));

jest.mock('@/libs/hooks/global/rulesets/use-global-rule-set-update', () => ({
  useGlobalRuleSetUpdate: () => {
    return updateGlobalRuleSet;
  },
}));

const mockMerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};

const MOCK_CATEGORY_ID = 'Cat123';
const NEW_RULE_BUTTON_TEXT = 'Add new rule';
const mockId = 'ewfw-e3f23-f23f2-3cwef3';

const mockRouter = {
  push: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
};

describe('Global Facet Management', () => {
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
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          },
          lastChanged: {
            date: '12/12/12',
            user: 'me',
          },
        })
      ),
      error: '',
    });

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
      error: '',
      isLoading: false,
    });
  });

  beforeEach(() => {
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      pagination: {
        totalItems: 5,
      },
      refetch: jest.fn(),
      isLoading: false,
    });
  });

  it('displays the list of facets', () => {
    renderWithProviders(<FacetManagementPage />);

    expect(screen.getByText('*')).toBeVisible();
  });

  it('creates a new rule set and redirects to the edit page', async () => {
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
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(<FacetManagementPage />);

    const createButton = await screen.findByText(NEW_RULE_BUTTON_TEXT);
    act(() => {
      createButton.click();
    });

    expect(await screen.findByText(NEW_RULE_BUTTON_TEXT)).toBeInTheDocument();

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/global/facets/edit/${MOCK_CATEGORY_ID}`
    );
  });

  it('should open delete modal and close on cancel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FacetManagementPage />);

    const search = screen.getByPlaceholderText(/Search\.\.\./i);

    await user.type(search, 'search-search');

    await waitFor(() =>
      expect(useRuleSet).toHaveBeenCalledWith('search-search', 0, 10, 'global')
    );
  });

  it('should enable or disable a global ruleset', async () => {
    renderWithProviders(<FacetManagementPage />);

    const rulesetToggle = screen.getAllByTitle('Toggle');

    await userEvent.click(rulesetToggle[0]);

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith({
      ruleSetId: mockId,
      ruleSet: {
        isEnabled: false,
        rules: mockMerchandisingRules,
      },
    });
  });

  it('should delete a ruleset', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FacetManagementPage />);

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

    await user.click(rulesetDropdown[0]);
    const reRenderedDeleteButton = screen.getByRole('button', {
      name: 'Delete',
    });
    await user.click(reRenderedDeleteButton);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: 'Do you want to delete this rule?',
        })
      ).toBeVisible();
    });
    await user.click(screen.getByLabelText('Delete rule'));
    expect(mockRuleSetDelete).toHaveBeenCalledWith({ rulesetId: mockId });
  });

  describe('Error display', () => {
    it('should display an error message when fetching the global ruleset fails', async () => {
      jest.mocked(useRuleSet).mockReturnValue({
        globalRuleSets: [],
        categoryRuleSets: [],
        pagination: {
          totalItems: 0,
        },
        refetchRuleSetList: () => jest.fn,
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: 'An error occurred',
        isLoading: false,
      });

      renderWithProviders(<FacetManagementPage />);

      expect(
        screen.getByText('Error whilst retrieving ruleset: An error occurred')
      ).toBeVisible();
    });

    it('should display an error message when updating a global ruleset fails', async () => {
      updateGlobalRuleSet.error = 'An error occurred';
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
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<FacetManagementPage />);

      expect(
        screen.getByText('Error whilst updating ruleset: An error occurred')
      ).toBeVisible();
    });

    it('should display an error message when deleting a global ruleset fails', async () => {
      deleteGlobalRuleSet.error = 'An error occurred';
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
        setCategoryRuleSets: jest.fn(),
        setGlobalRuleSets: jest.fn(),
        error: '',
        isLoading: false,
      });

      renderWithProviders(<FacetManagementPage />);

      expect(
        screen.getByText('Error whilst deleting ruleset: An error occurred')
      ).toBeVisible();
    });
  });

  it('should show the country flag if Ireland feature flag is enabled', async () => {
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
          countryCode: 'IE',
        },
      ],
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasScheduling: false, hasIreland: true }}
      >
        <FacetManagementPage />
      </FeatureFlagContext.Provider>
    );

    expect(screen.getByAltText('IE rule')).toBeInTheDocument();
  });

  it('should not display the country flag if Ireland feature flag is not enabled', async () => {
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
          countryCode: 'IE',
        },
      ],
      categoryRuleSets: [],
      pagination: {
        totalItems: 0,
      },
      refetchRuleSetList: () => jest.fn,
      setCategoryRuleSets: jest.fn(),
      setGlobalRuleSets: jest.fn(),
      error: '',
      isLoading: false,
    });

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasScheduling: false, hasIreland: false }}
      >
        <FacetManagementPage />
      </FeatureFlagContext.Provider>
    );

    expect(screen.queryByAltText('IE rule')).not.toBeInTheDocument();
  });
});
