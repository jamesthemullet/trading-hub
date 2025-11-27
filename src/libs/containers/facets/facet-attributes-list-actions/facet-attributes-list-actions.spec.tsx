import { render, screen } from '@testing-library/react';

import { FacetAttributesListActions } from './facet-attributes-list-actions';

const defaultProps = {
  onSearchChange: jest.fn(),
  writeEnabled: true,
};

describe('FacetAttributesListActions', () => {
  it('renders merge button as disabled', () => {
    render(<FacetAttributesListActions {...defaultProps} />);
    expect(screen.getByText('Merge')).toBeInTheDocument();
    expect(screen.getByText('Merge').closest('button')).toBeDisabled();
  });

  it('renders the search input', () => {
    render(<FacetAttributesListActions {...defaultProps} />);
    // The input is inside the custom Search component, so we check for input presence
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });
});
