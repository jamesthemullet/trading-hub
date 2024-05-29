import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { globalFacetsListMock } from '@/pages/api/merchandising/mocks';

import { FacetsTableRow } from './facets-table-row';

const mockFacets = globalFacetsListMock.facets;

describe('Facets', () => {
  it('should render facet row', () => {
    render(
      <FacetsTableRow
        facet={mockFacets[0]}
        canToggle
        editUrl="../../../facets/edit"
      />
    );

    expect(screen.getByText('color')).toBeInTheDocument();
  });

  it('should render facet row with delete button', async () => {
    const user = userEvent.setup();
    const deleteSpy = jest.fn();

    render(
      <FacetsTableRow
        facet={mockFacets[0]}
        canToggle
        editUrl="../../../facets/edit"
        canDelete
        onDeleteFacet={deleteSpy}
      />
    );

    await user.click(screen.getAllByTitle('More options')[0]);

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);

    expect(deleteSpy).toHaveBeenCalled();
  });
});
