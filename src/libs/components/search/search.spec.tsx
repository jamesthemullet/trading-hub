import { screen } from '@testing-library/react';

import { renderWithProviders } from '@onyx/test-utils';

import { Search } from './search';

describe('Search', () => {
  it('should render rules search', () => {
    renderWithProviders(<Search />);

    expect(screen.getByPlaceholderText(/Search\.\.\./i)).toBeInTheDocument();
  });
});
