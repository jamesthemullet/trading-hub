import { render, screen } from '@testing-library/react';

import { FacetsManagementTable } from './facets';

import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

const mockFacets = globalFacetsListMock.facets.map((facet) => ({
  ...facet,
  isEnabled: false,
}));

describe('Facets', () => {
  it('should render facet headings', () => {
    render(
      <FacetsManagementTable
        facets={mockFacets}
        editUrl="../../../facets/edit"
      />
    );

    expect(screen.getByText('Identifier')).toBeInTheDocument();
  });

  it('should render list of facets', () => {
    render(
      <FacetsManagementTable
        facets={mockFacets}
        editUrl="../../../facets/edit"
      />
    );

    expect(screen.getByText('color')).toBeInTheDocument();
  });
});
