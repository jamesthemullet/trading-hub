import { screen } from '@testing-library/react';
import { FacetsPanelSkeleton } from './facets-panel-skeleton';
import { renderWithProviders } from '@/test/render-with-providers';

describe('facets-panel-skeleton', () => {
  describe('FacetsPanelSkeleton', () => {
    it('should render the FacetsPanelSkeleton component', () => {
      renderWithProviders(<FacetsPanelSkeleton title="this is a title" />);

      expect(screen.getByText('this is a title')).toBeVisible();
    });
  });
});
