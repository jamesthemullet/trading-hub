import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { FacetsPanelSkeleton } from './facets-panel-skeleton';

describe('facets-panel-skeleton', () => {
  describe('FacetsPanelSkeleton', () => {
    it('should render the FacetsPanelSkeleton component', () => {
      renderWithProviders(<FacetsPanelSkeleton title="this is a title" />);

      expect(screen.getByText('this is a title')).toBeVisible();
    });
  });
});
