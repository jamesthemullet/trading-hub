import { render, screen } from '@testing-library/react';

import { useFacetsListMockData } from '@/libs/hooks/data/mock-use-facets-list';

import { Facets } from './facets';

const mockFacets = useFacetsListMockData.facets.map((facet) => ({
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

    expect(screen.getByText('facet1')).toBeInTheDocument();
  });
});
