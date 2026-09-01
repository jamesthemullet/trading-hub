import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedKeywordRuleSet } from '@/libs/api';
import {
  useGetFacetAttributeValues,
  useSearchRuleSetPreview,
  useSearchRuleSetUpdate,
} from '@/libs/hooks';
import type { SaveResult } from '@/libs/hooks/use-optimistic-update';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { mockUseSearchRuleSetPreviewData } from '@/test/data/mock-use-search-ruleset-preview';
import { renderWithProviders } from '@/test/render-with-providers';

import intersection from 'lodash/intersection';
import without from 'lodash/without';

import Page from './index.page';

const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('lodash/intersection', () => jest.fn());
jest.mock('lodash/without', () => jest.fn());

const updateMock = {
  shouldUseV1: false,
  searchTerms: ['foo', 'bar'],
  countryCode: 'UK_IE',
  ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
  excludedFacets: {
    facets: [
      {
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
      },
    ],
  },
  facets: [
    {
      displayValue: 'color',
      boosted: ['blue', 'green'],
      excludedValues: ['Brown'],
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
      indexPropertyName: 'color',
      lastChanged: {
        date: '2021-01-01T08:34:15Z',
        user: 'Test User',
      },
      merged: [
        {
          displayValue: 'test merged group',
          mergedValues: ['merged 1', 'merged 2'],
        },
      ],
      type: 'root',
    },
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
    },
    {
      boosted: [],
      excludedValues: [],
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
    },
  ],
  isEnabled: false,
  rules: {
    pinnedProducts: [{ id: 'a1' }],
    blockedProducts: [],
    boosts: {
      numeric: [],
      alphanumeric: [],
      product: [],
    },
    buries: {
      numeric: [],
      alphanumeric: [],
      product: [],
    },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  id: '090152b8-2517-4e42-a5f3-48fcab8d9942',
  lastChanged: {
    date: '',
    user: '',
  },
};

const mockUpdateRuleSet = {
  updateRuleSet: jest.fn(
    (): Promise<SaveResult<MerchandisingReturnedKeywordRuleSet>> =>
      Promise.resolve({ status: 'success' })
  ),
  isSaving: true,
  error: '',
};

const mockUseDraftRuleset = {
  getDraft: jest.fn(),
  saveDraft: jest.fn(),
  clearDraft: jest.fn(),
  isDraftRuleset: jest.fn(),
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useSearchRuleSetUpdate: jest.fn(),
  useGetFacetAttributeValues: jest.fn(),
  useSearchRuleSetPreview: jest.fn(),
  useFacetsList: () => {
    return mockUseFacetsList;
  },
  useDraftRuleset: () => mockUseDraftRuleset,
}));

jest.mock('@/libs/hooks/global/facets/use-global-facets-list', () => ({
  useGlobalFacetsList: () => ({
    facets: facetsListMock.facets,
    isLoading: false,
    error: '',
    onRefreshFacetList: jest.fn(),
  }),
}));

describe('Index', () => {
  const defaultMockRouter = {
    query: {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
      searchTerms: 'dress',
      ruleSetId,
      displayName: 'Color',
    },
    push: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDraftRuleset.getDraft.mockReturnValue(null);
    (useRouter as jest.Mock).mockReturnValue(defaultMockRouter);
    (intersection as jest.Mock).mockReturnValue(['red']);
    (without as jest.Mock).mockReturnValue(['blue', 'green']);
    jest.mocked(useSearchRuleSetUpdate).mockReturnValue(mockUpdateRuleSet);
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });

    jest
      .mocked(useSearchRuleSetPreview)
      .mockImplementation(() => mockUseSearchRuleSetPreviewData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render layout when isLoading is true and isDraft is false', async () => {
    jest.mocked(useSearchRuleSetPreview).mockImplementation(() => ({
      ...mockUseSearchRuleSetPreviewData,
      isLoading: true,
    }));

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.queryByText('New Facet Values')).not.toBeInTheDocument();
    });
  });

  it('should handle undefined searchTerm', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        searchTerms: undefined,
      },
    });

    renderWithProviders(<Page />);
    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should handle searchTerms as array', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        searchTerms: ['term 1', 'term 2', 'term 3'],
      },
    });

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should handle no boosted/excluded items in facet', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
        searchTerms: ['term 1', 'term 2'],
      },
    });

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should render new facet values page if feature flag is enabled', async () => {
    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should handle searchQuery changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
    await waitFor(() => {
      expect(screen.getByTestId('Label for Cotton')).toBeVisible();
    });
    const blueRow = screen.getByTestId('Label for blue');
    const greenRow = screen.getByTestId('Label for green');
    expect(greenRow).toBeVisible();
    expect(blueRow).toBeVisible();

    const searchInput = await screen.findByPlaceholderText('Search');

    await user.type(searchInput, 'blue');

    await waitFor(() => {
      expect(greenRow).not.toBeVisible();
    });

    expect(blueRow).toBeVisible();
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Save changes' })
    );

    expect(mockUpdateRuleSet.updateRuleSet).toHaveBeenCalledWith(updateMock);

    expect(defaultMockRouter.push).toHaveBeenCalledWith('/search');
  });

  it('sends the v1 flag + version and shows the conflict modal on a 409', async () => {
    mockUpdateRuleSet.updateRuleSet.mockResolvedValueOnce({
      status: 'conflict' as const,
      currentEntity: {
        ...mockUseSearchRuleSetPreviewData.ruleSet,
        version: 7,
        lastChanged: { date: '2024-02-02T00:00:00Z', user: 'Other User' },
      },
    });
    jest.mocked(useSearchRuleSetPreview).mockImplementation(() => ({
      ...mockUseSearchRuleSetPreviewData,
      ruleSet: { ...mockUseSearchRuleSetPreviewData.ruleSet, version: 3 },
    }));

    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Page />, undefined, {
      featureFlags: { hasOptimisticLocking: true },
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Save changes' })
    );

    expect(mockUpdateRuleSet.updateRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ shouldUseV1: true, version: 3 })
    );
    expect(
      await screen.findByRole('dialog', {
        name: 'This keyword ruleset was changed by someone else',
      })
    ).toBeInTheDocument();
    expect(defaultMockRouter.push).not.toHaveBeenCalled();
  });

  it('should display error message when updating ruleset fails', async () => {
    mockUpdateRuleSet.error = 'Failed to update';
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.getByText('Error whilst updating ruleset: Failed to update')
    ).toBeVisible();
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(
      screen.getByText('please contact admin on our teams channel', {
        exact: false,
      })
    ).toBeVisible();
  });

  describe('draft rulesets', () => {
    it('should load and use draft ruleset when ruleSetId is "draft"', async () => {
      const mockDraftData = {
        ruleset: {
          id: '123',
          isEnabled: true,
          facets: [
            {
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
              displayValue: 'color',
              indexPropertyName: 'color',
              boosted: ['red'],
              excludedValues: [],
            },
          ],
          searchTerms: ['test'],
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: { alphanumeric: [] },
            excludes: { alphanumeric: [] },
          },
        },
        type: 'search' as const,
        timestamp: Date.now(),
      };

      mockUseDraftRuleset.getDraft.mockReturnValue(mockDraftData);

      (useRouter as jest.Mock).mockReturnValue({
        ...defaultMockRouter,
        query: {
          ...defaultMockRouter.query,
          ruleSetId: 'draft',
        },
      });

      renderWithProviders(<Page />);

      expect(mockUseDraftRuleset.getDraft).toHaveBeenCalled();
    });

    it('should save draft and navigate when onSave is called in draft mode', async () => {
      const mockDraftData = {
        ruleset: {
          id: '123',
          isEnabled: true,
          facets: [
            {
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
              displayValue: 'color',
              indexPropertyName: 'color',
              boosted: ['red'],
              excludedValues: [],
            },
            {
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
              displayValue: 'size',
              indexPropertyName: 'size',
              boosted: ['m'],
              excludedValues: [],
            },
          ],
          searchTerms: ['test'],
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            includes: { alphanumeric: [] },
            excludes: { alphanumeric: [] },
          },
        },
        type: 'search' as const,
        timestamp: Date.now(),
      };

      mockUseDraftRuleset.getDraft.mockReturnValue(mockDraftData);

      (useRouter as jest.Mock).mockReturnValue({
        ...defaultMockRouter,
        query: {
          ...defaultMockRouter.query,
          ruleSetId: 'draft',
        },
      });

      const user = userEvent.setup({ delay: null });

      renderWithProviders(<Page />);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUseDraftRuleset.saveDraft).toHaveBeenCalledWith({
          ruleset: {
            facets: [
              {
                boosted: ['blue', 'green'],
                displayValue: 'color',
                excludedValues: ['Brown'],
                id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
                indexPropertyName: 'color',
                lastChanged: {
                  date: '2021-01-01T08:34:15Z',
                  user: 'Test User',
                },
                merged: [
                  {
                    displayValue: 'test merged group',
                    mergedValues: ['merged 1', 'merged 2'],
                  },
                ],
                type: 'root',
              },
              {
                boosted: ['m'],
                displayValue: 'size',
                excludedValues: [],
                id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
                indexPropertyName: 'size',
              },
            ],
            id: '123',
            isEnabled: true,
            rules: {
              blockedProducts: [],
              boosts: { alphanumeric: [], numeric: [], product: [] },
              buries: { alphanumeric: [], numeric: [], product: [] },
              excludes: { alphanumeric: [] },
              includes: { alphanumeric: [] },
              pinnedProducts: [],
            },
            searchTerms: ['test'],
          },
          type: 'search',
        });
      });

      await waitFor(() => {
        expect(defaultMockRouter.push).toHaveBeenCalledWith(
          '/search/facets/new?ruleSetId=draft'
        );
      });
    });

    it('should update the ruleset when not in draft mode', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(<Page />);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      const dialog = await screen.findByRole('dialog');
      await user.click(
        within(dialog).getByRole('button', { name: 'Save changes' })
      );

      expect(mockUpdateRuleSet.updateRuleSet).toHaveBeenCalled();
      expect(defaultMockRouter.push).toHaveBeenCalledWith('/search');
    });
  });

  it('should render facet panel when isLoading is false and isDraft is true', async () => {
    const mockDraftData = {
      ruleset: {
        id: '123',
        isEnabled: true,
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
            displayValue: 'color',
            indexPropertyName: 'color',
            boosted: ['red'],
            excludedValues: [],
          },
        ],
        searchTerms: ['test'],
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: { numeric: [], alphanumeric: [], product: [] },
          buries: { numeric: [], alphanumeric: [], product: [] },
          includes: { alphanumeric: [] },
          excludes: { alphanumeric: [] },
        },
      },
      type: 'search' as const,
      timestamp: Date.now(),
    };

    mockUseDraftRuleset.getDraft.mockReturnValue(mockDraftData);

    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        ruleSetId: 'draft',
      },
    });

    jest.mocked(useSearchRuleSetPreview).mockImplementation(() => ({
      ...mockUseSearchRuleSetPreviewData,
      isLoading: false,
    }));

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });

    expect(
      screen.getByText('Facet values settings: Color')
    ).toBeInTheDocument();
  });

  it('should update ruleset facets when not in draft mode with no pre-existing facets', async () => {
    jest.mocked(useSearchRuleSetPreview).mockImplementation(() => ({
      ...mockUseSearchRuleSetPreviewData,
      ruleSet: {
        ...mockUseSearchRuleSetPreviewData.ruleSet,
        facets: undefined,
        searchTerms: undefined as unknown as string[],
      },
    }));

    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />);

    const saveButton = await screen.findByRole('button', { name: 'Save' });
    await user.click(saveButton);

    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Save changes' })
    );

    expect(mockUpdateRuleSet.updateRuleSet).toHaveBeenCalled();
    expect(defaultMockRouter.push).toHaveBeenCalledWith('/search');
  });
});
