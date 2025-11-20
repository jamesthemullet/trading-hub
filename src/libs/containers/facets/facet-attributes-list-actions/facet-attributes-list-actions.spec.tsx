import { render, screen } from '@testing-library/react';

import { FacetAttributesListActions } from './facet-attributes-list-actions';

describe('FacetAttributesListActions', () => {
  it('renders merge button as disabled', () => {
    render(<FacetAttributesListActions onSearchChange={jest.fn()} />);
    expect(screen.getByText('Merge')).toBeInTheDocument();
    expect(screen.getByText('Merge').closest('button')).toBeDisabled();
  });

  it('renders the search input', () => {
    render(<FacetAttributesListActions onSearchChange={jest.fn()} />);
    // The input is inside the custom Search component, so we check for input presence
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
