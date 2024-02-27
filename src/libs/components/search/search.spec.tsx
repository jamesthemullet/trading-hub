import { screen, render } from '@testing-library/react';

import { Search } from './search';

describe('Search', () => {
  it('should render rules search', () => {
    render(<Search />);

    expect(screen.getByPlaceholderText(/Search\.\.\./i)).toBeInTheDocument();
  });

  it('should render custom placeholder search', () => {
    render(<Search placeholder="placeholder" />);

    expect(screen.getByPlaceholderText('placeholder')).toBeInTheDocument();
  });
});
