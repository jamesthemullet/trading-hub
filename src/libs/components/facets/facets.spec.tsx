import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFacetsListMockData } from '../../hooks/data/mock-use-facets-list';

import { Facets } from './facets';

const mockFacets = useFacetsListMockData.facets.map((facet) => ({
  ...facet,
  isEnabled: false,
}));

describe('Facets', () => {
  it('should render facet headings', () => {
    render(
      <Facets
        facets={mockFacets}
        columnOrderName="displayValue"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
      />
    );

    expect(screen.getByText('Identifier')).toBeInTheDocument();
  });

  it('should render list of facets', () => {
    render(
      <Facets
        facets={mockFacets}
        columnOrderName="displayValue"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
      />
    );

    expect(screen.getByText('facet1')).toBeInTheDocument();
  });

  it('should call callback on order change', async () => {
    const user = userEvent.setup();
    const mockCallback = jest.fn();
    render(
      <Facets
        facets={mockFacets}
        columnOrderName="displayValue"
        columnSortOrder="asc"
        onColumnOrderChange={mockCallback}
      />
    );

    await user.click(screen.getByText('Identifier'));

    expect(mockCallback).toHaveBeenCalledWith('displayValue');
  });

  it('should toggle the isEnabled option', async () => {
    const user = userEvent.setup();
    render(
      <Facets
        facets={mockFacets}
        columnOrderName="displayValue"
        columnSortOrder="asc"
        onColumnOrderChange={jest.fn()}
      />
    );

    await user.click(screen.getAllByTitle('Toggle')[0]);

    expect(screen.getAllByTitle('Toggle')[0]).toBeInTheDocument();
  });
});
