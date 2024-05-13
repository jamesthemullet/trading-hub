import { render, screen } from '@testing-library/react';

import { FilteredResultsPanel } from './filtered-results-panel';

describe('FilteredResultsPanel', () => {
  it('should render the FilteredResultsPanel component', () => {
    const filteredFacets = 5;
    render(<FilteredResultsPanel filteredFacets={filteredFacets} />);

    expect(screen.getByText('5 results')).toBeInTheDocument();
  });
});
