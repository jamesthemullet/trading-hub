import { screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Index', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        id: '124',
        searchTerms: 'dress',
        ruleSetId,
        displayName: 'Color',
      },
    });
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
});
