import { render, screen } from '@testing-library/react';

import { FacetAttributesListActions } from './facet-attributes-list-actions';

describe('FacetAttributesListActions', () => {
  it('renders Multi-select and Merge buttons as disabled', () => {
    render(<FacetAttributesListActions />);
    expect(screen.getByText('Multi-select')).toBeInTheDocument();
    expect(screen.getByText('Merge')).toBeInTheDocument();
    expect(screen.getByText('Multi-select').closest('button')).toBeDisabled();
    expect(screen.getByText('Merge').closest('button')).toBeDisabled();
  });

  it('renders the search input', () => {
    render(<FacetAttributesListActions />);
    // The input is inside the custom Search component, so we check for input presence
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
