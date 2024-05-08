import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../test/render-with-providers';
import { ModalAddFacets } from './modal-add-facets';

describe('Add Facet Modal', () => {
  it('should filter attributes on user input', async () => {
    renderWithProviders(<ModalAddFacets onClose={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('Search...'), 'Cotton');

    expect(screen.queryByText('Duck Down')).not.toBeInTheDocument();
    expect(screen.getByText('Cotton')).toBeVisible();
    expect(screen.queryByText('No records found')).not.toBeInTheDocument();
  });

  it('should show "No records found" when no attributes match the search', async () => {
    renderWithProviders(<ModalAddFacets onClose={() => {}} />);

    await userEvent.type(
      screen.getByPlaceholderText('Search...'),
      'Non-existent attribute'
    );

    expect(screen.getByText('No records found')).toBeVisible();
  });
});
