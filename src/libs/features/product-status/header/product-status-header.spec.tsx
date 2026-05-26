import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import ProductStatusHeader from './product-status-header';

const mockOnQueryChange = jest.fn();
const mockOnSearch = jest.fn((e: React.FormEvent<HTMLFormElement>) =>
  e.preventDefault()
);

const defaultProps = {
  query: '',
  onQueryChange: mockOnQueryChange,
  onSearch: mockOnSearch,
  onRecentSearchesClick: jest.fn(),
};

describe('ProductStatusHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the heading and subtitle', () => {
    renderWithProviders(<ProductStatusHeader {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'Product status search' })
    ).toBeInTheDocument();
    expect(screen.getByText('Use the P number to search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. 60538523')).toBeInTheDocument();
  });

  it('should display the current query value', () => {
    renderWithProviders(
      <ProductStatusHeader {...defaultProps} query="60538523" />
    );

    expect(screen.getByPlaceholderText('e.g. 60538523')).toHaveValue(
      '60538523'
    );
  });

  it('should call onQueryChange when typing in the search input', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<ProductStatusHeader {...defaultProps} />);

    await user.type(screen.getByPlaceholderText('e.g. 60538523'), '123');

    expect(mockOnQueryChange).toHaveBeenCalledWith('1');
    expect(mockOnQueryChange).toHaveBeenCalledWith('2');
    expect(mockOnQueryChange).toHaveBeenCalledWith('3');
  });
});
