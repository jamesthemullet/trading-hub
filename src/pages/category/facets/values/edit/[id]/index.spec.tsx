import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGetFacetAttributeValues, useRuleSetDetail } from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import {
  mockUseRuleSetPreviewData,
  ruleSetId,
} from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import intersection from 'lodash/intersection';
import without from 'lodash/without';

import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('lodash/intersection', () => jest.fn());
jest.mock('lodash/without', () => jest.fn());

const mockUseDraftRuleset = {
  getDraft: jest.fn(),
  saveDraft: jest.fn(),
  clearDraft: jest.fn(),
  isDraftRuleset: jest.fn(),
};

const mockRulesetDetailResponse = {
  ...mockUseRuleSetPreviewData,
  isLoading: false,
  isSaving: false,
};

const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
};

const mockUpdateRuleSet = jest
  .fn()
  .mockResolvedValue({ status: 'success' as const });
const updateRuleSet = {
  updateCategoryRuleSet: mockUpdateRuleSet,
  error: '',
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useUpdateRuleSet: () => {
    return updateRuleSet;
  },
  useGetFacetAttributeValues: jest.fn(),
  useRuleSetDetail: jest.fn(),
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
      categories: 'subCategory_429',
      ruleSetId,
      displayName: 'Color',
      countryCode: 'UK_IE',
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
    (useRouter as jest.Mock).mockReturnValue(defaultMockRouter);
    (intersection as jest.Mock).mockReturnValue(['red']);
    (without as jest.Mock).mockReturnValue(['blue', 'green']);
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
    jest
      .mocked(useRuleSetDetail)
      .mockImplementation(() => mockRulesetDetailResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render new facet values page', async () => {
    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should handle undefined categories', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        categories: undefined,
      },
    });

    renderWithProviders(<Page />);
    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should handle categories as array', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        categories: ['category1', 'category2', 'category3'],
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
        categories: ['category1', 'category2', 'category3'],
      },
    });

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should filter non-string values from categories array', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        categories: [
          'category1',
          123,
          null,
          'category2',
          undefined,
          'category3',
        ],
      },
    });

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

  it('should call updateCategoryRuleSet on save', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Save changes' })
    );

    expect(mockUpdateRuleSet).toHaveBeenCalledWith({
      categoryIds: ['SubCategory_428'],
      countryCode: 'UK_IE',
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
      excludedFacets: {
        facets: [
          {
            id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
          },
        ],
      },
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

      isEnabled: false,
      facets: [
        {
          boosted: ['blue', 'green'],
          excludedValues: ['test exclude'],
          id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
          displayValue: 'color',
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
    });

    expect(defaultMockRouter.push).toHaveBeenCalledWith('/category');
  });

  it('sends the v1 flag + version and shows the conflict modal on a 409', async () => {
    mockUpdateRuleSet.mockResolvedValueOnce({
      status: 'conflict' as const,
      currentEntity: {
        ...mockRulesetDetailResponse.ruleSetDetail,
        version: 7,
        lastChanged: { date: '2024-02-02T00:00:00Z', user: 'Other User' },
      },
    });
    const versionedDetail = {
      ...mockRulesetDetailResponse,
      ruleSetDetail: {
        ...mockRulesetDetailResponse.ruleSetDetail,
        version: 3,
      },
    };
    jest.mocked(useRuleSetDetail).mockImplementation(() => versionedDetail);

    const user = userEvent.setup();
    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Save changes' })
    );

    expect(mockUpdateRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ version: 3 })
    );
    expect(
      await screen.findByRole('dialog', {
        name: 'This category ruleset was changed by someone else',
      })
    ).toBeInTheDocument();
    expect(defaultMockRouter.push).not.toHaveBeenCalled();
  });

  it('should display error message when updating ruleset fails', async () => {
    updateRuleSet.error = 'Failed to update';

    renderWithProviders(<Page />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.getByText('Error whilst updating ruleset: Failed to update')
    ).toBeVisible();
  });

  it('should default to using countryCode of UK_IE if not in route params', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        countryCode: undefined,
      },
    });

    renderWithProviders(<Page />);
    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
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

      await waitFor(() => {
        expect(screen.getByText('Facet values settings: Color')).toBeVisible();
      });
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
        type: 'category' as const,
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

      expect(mockUseDraftRuleset.saveDraft).toHaveBeenCalledWith({
        ruleset: expect.objectContaining({
          facets: expect.arrayContaining([
            expect.objectContaining({
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
              boosted: ['blue', 'green'],
              excludedValues: ['test exclude'],
            }),
            expect.objectContaining({
              id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
              boosted: ['m'],
              excludedValues: [],
            }),
          ]),
        }),
        type: 'category',
      });

      expect(defaultMockRouter.push).toHaveBeenCalledWith(
        '/category/facets/new?ruleSetId=draft'
      );
    });
  });
});
