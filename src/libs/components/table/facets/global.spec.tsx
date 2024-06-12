import { render, screen } from '@testing-library/react';

import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

import { GlobalFacetsManagementTable } from './global';

const mockFacets = globalFacetsListMock.facets.map((facet) => ({
  ...facet,
  isEnabled: false,
}));

describe('Facets', () => {
  it('should render facet headings', () => {
    render(
      <GlobalFacetsManagementTable
        facets={mockFacets}
        editUrl="../../../facets/edit"
      />
    );

    expect(screen.getByText('Identifier')).toBeInTheDocument();
  });

  it('should render list of facets', () => {
    render(
      <GlobalFacetsManagementTable
        facets={mockFacets}
        editUrl="../../../facets/edit"
      />
    );

    expect(screen.getByText('color')).toBeInTheDocument();
  });
});
