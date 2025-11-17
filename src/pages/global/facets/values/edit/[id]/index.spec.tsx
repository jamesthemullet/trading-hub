import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGlobalFacetsList } from '@/libs/hooks';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';
import { attributeValuesMock, facetsListMock } from '@/pages/api/search/mocks';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks/global/facets/use-global-facets-list', () => ({
  useGlobalFacetsList: jest.fn(),
}));

jest.mock('@/libs/hooks/use-get-facet-attribute-values', () => ({
  useGetFacetAttributeValues: jest.fn(),
}));

describe('Index', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
        searchTerms: 'dress',
        ruleSetId,
        displayName: 'Color',
      },
    });
    jest.mocked(useGlobalFacetsList).mockReturnValue({
      isLoading: false,
      facets: facetsListMock.facets,
      error: '',
      onRefreshFacetList: jest.fn(),
    });
    jest.mocked(useGetFacetAttributeValues).mockReturnValue({
      attributeValues: attributeValuesMock,
      error: '',
      isLoading: false,
    });
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

  describe('searching', () => {
    it('should display the correct amount of filtered items when the merge group name matches the filter', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<Page />, [], {
        featureFlags: {
          hasAuthorization: true,
          showNewFacetValuesPage: true,
        },
      });

      await waitFor(() => {
        expect(screen.getByText('12 results')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search');

      await user.type(searchInput, 'test merged group');

      await waitFor(() => {
        expect(screen.getByText('1 result')).toBeInTheDocument();
      });
    });

    it('should display the correct amount of filtered items when the attribute values matches the filter', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<Page />, [], {
        featureFlags: {
          hasAuthorization: true,
          showNewFacetValuesPage: true,
        },
      });

      const searchInput = screen.getByPlaceholderText('Search');

      await user.type(searchInput, 'Duck Down');

      await waitFor(() => {
        expect(screen.getByText('2 results')).toBeInTheDocument();
      });
    });

    it('should display the correct amount of filtered items when the merged value group includes it', async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<Page />, [], {
        featureFlags: {
          hasAuthorization: true,
          showNewFacetValuesPage: true,
        },
      });

      const searchInput = screen.getByPlaceholderText('Search');

      await user.type(searchInput, 'merged 1');

      await waitFor(() => {
        expect(screen.getByText('3 results')).toBeInTheDocument();
      });
    });
  });
});
