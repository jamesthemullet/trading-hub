import { screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Index', () => {
  const defaultMockRouter = {
    query: {
      id: '124',
      categories: 'subCategory_429',
      ruleSetId,
      displayName: 'Color',
      countryCode: 'UK_IE',
    },
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(defaultMockRouter);
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
});
