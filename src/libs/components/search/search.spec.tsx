import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Search, SearchBox } from './search';

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

describe('SearchBox', () => {
  it('should render successfully', () => {
    render(
      <SearchBox
        inputProps={{
          id: 'searchId',
          label: 'search products',
          value: 'some value',
          onChange: jest.fn,
        }}
      />
    );

    const input = screen.getByLabelText('search products');

    expect(input).toHaveValue('some value');
    expect(screen.getByRole('searchbox')).toHaveAttribute('id', 'searchId');
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('should call onChange with empty value when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SearchBox
        inputProps={{
          id: 'searchId',
          label: 'search products',
          value: 'test value',
          onChange,
        }}
      />
    );

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: '' }),
        currentTarget: expect.objectContaining({ value: '' }),
      })
    );
  });

  it('should not throw error when clear button is clicked without onChange handler', async () => {
    const user = userEvent.setup();

    render(
      <SearchBox
        inputProps={{
          id: 'searchId',
          label: 'search products',
          value: 'test value',
        }}
      />
    );

    const clearButton = screen.getByRole('button', { name: 'Clear search' });

    await expect(user.click(clearButton)).resolves.not.toThrow();
  });
});
