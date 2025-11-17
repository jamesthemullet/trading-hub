import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGetFacetAttributeValues, useRuleSetDetail } from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import {
  mockUseRuleSetPreviewData,
  ruleSetId,
} from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import * as lodash from 'lodash';

import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  intersection: jest.fn(),
  without: jest.fn(),
}));

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

const mockUpdateRuleSet = jest.fn().mockReturnValue(true);
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(defaultMockRouter);
    (lodash.intersection as jest.Mock).mockReturnValue(['red']);
    (lodash.without as jest.Mock).mockReturnValue(['blue', 'green']);
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

  it('should render coming soon if feature flag is disabled', async () => {
    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Coming soon/loading')).toBeVisible();
    });
  });

  it('should render new facet values page if feature flag is enabled', async () => {
    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

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

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });
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

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

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

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

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

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });

  it('should handle searchQuery changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

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

    const searchInput = await screen.findByPlaceholderText('Search...');

    await user.type(searchInput, 'blue');

    await waitFor(() => {
      expect(greenRow).not.toBeVisible();
    });

    expect(blueRow).toBeVisible();
  });

  it('should call updateCategoryRuleSet on save', async () => {
    const user = userEvent.setup();

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

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

  it('should display error message when updating ruleset fails', async () => {
    updateRuleSet.error = 'Failed to update';

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

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

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Facet values settings: Color')).toBeVisible();
    });
  });
});
