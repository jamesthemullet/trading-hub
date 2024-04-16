import { screen } from '@testing-library/react';

import { ModalAddFacets } from './modal-add-facets';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/render-with-providers';

describe('Add Facet Modal', () => {
  it('should filter attributes on user input', async () => {
    renderWithProviders(<ModalAddFacets onClose={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('Search...'), 'Cotton');

    expect(screen.queryByText('Duck Down')).not.toBeInTheDocument();
    expect(screen.getByText('Cotton')).toBeVisible();
  });
});
