import { render, screen } from '@testing-library/react';

import { Facets } from './facets';
import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

const mockFacets = globalFacetsListMock.facets.map((facet) => ({
  ...facet,
  isEnabled: false,
}));

describe('Facets', () => {
  it('should render facet headings', () => {
    render(<Facets facets={mockFacets} />);

    expect(screen.getByText('Identifier')).toBeInTheDocument();
  });

  it('should render list of facets', () => {
    render(<Facets facets={mockFacets} />);

    expect(screen.getByText('color')).toBeInTheDocument();
  });
});
