import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import {
  useGetFacetAttributeValues,
  useSearchRuleSetPreview,
  useSearchRuleSetUpdate,
} from '@/libs/hooks';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { mockUseSearchRuleSetPreviewData } from '@/test/data/mock-use-search-ruleset-preview';
import { renderWithProviders } from '@/test/render-with-providers';

import * as lodash from 'lodash';

import Page from './index.page';

const mockUseFacetsList = {
  isLoading: false,
  facets: facetsListMock.facets,
  error: '',
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  intersection: jest.fn(),
  without: jest.fn(),
}));

const updateMock = {
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
  updateRuleSet: jest.fn(() =>
    Promise.resolve({
      rules: {
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
      },
      searchTerms: ['foo', 'bar'],
      isEnabled: true,
      categoryName: 'Jeans',
      id: ruleSetId,
      categoriesInfo: [
        {
          id: ruleSetId,
        },
      ],
      lastChanged: { date: '2024-01-02T22:10:17Z', user: 'M&S' },
    })
  ),
  isSaving: true,
  error: '',
};

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useSearchRuleSetUpdate: jest.fn(),
  useGetFacetAttributeValues: jest.fn(),
  useSearchRuleSetPreview: jest.fn(),
  useFacetsList: () => {
    return mockUseFacetsList;
  },
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(defaultMockRouter);
    (lodash.intersection as jest.Mock).mockReturnValue(['red']);
    (lodash.without as jest.Mock).mockReturnValue(['blue', 'green']);
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

  it('should render coming soon if feature flag is not enabled', async () => {
    renderWithProviders(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Coming soon/loading')).toBeVisible();
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

  it('should handle searchTerms as array', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...defaultMockRouter,
      query: {
        ...defaultMockRouter.query,
        searchTerms: ['term 1', 'term 2', 'term 3'],
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
        searchTerms: ['term 1', 'term 2'],
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

    const searchInput = await screen.findByPlaceholderText('Search');

    await user.type(searchInput, 'blue');

    await waitFor(() => {
      expect(greenRow).not.toBeVisible();
    });

    expect(blueRow).toBeVisible();
  });

  it('should save changes to a facet', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockUpdateRuleSet.updateRuleSet).toHaveBeenCalledWith(updateMock);

    expect(defaultMockRouter.push).toHaveBeenCalledWith('/search');
  });

  it('should display error message when updating ruleset fails', async () => {
    mockUpdateRuleSet.error = 'Failed to update';
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<Page />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.getByText('Error whilst updating ruleset: Failed to update')
    ).toBeVisible();
  });
});
