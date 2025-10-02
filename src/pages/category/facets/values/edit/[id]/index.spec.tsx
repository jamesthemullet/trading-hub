import { screen } from '@testing-library/react';

import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';
import { renderWithProviders } from '@/test/render-with-providers';

import Page from './index.page';

describe('Index', () => {
  it('should render coming soon if feature flag is disabled', async () => {
    renderWithProviders(<Page id={ruleSetId} />, [], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(screen.getByText('Coming soon')).toBeVisible();
  });

  it('should render new facet values page if feature flag is enabled', async () => {
    renderWithProviders(<Page id={ruleSetId} />, [], {
      featureFlags: {
        hasAuthorization: true,
        showNewFacetValuesPage: true,
      },
    });

    expect(screen.getByText('New Facet Values Page Enabled')).toBeVisible();
  });
});
