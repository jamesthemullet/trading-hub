import { screen, render } from '@testing-library/react';

import { SearchBox } from './search-box';

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
        iconButtonProps={{ id: 'searchIconBtn' }}
      />
    );

    const input = screen.getByLabelText('search products');

    expect(input).toHaveValue('some value');
    expect(screen.getByLabelText('Search button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('id', 'searchIconBtn');
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    expect(input).toHaveStyleRule('background-color', '#ccc', {
      media: '(min-width: 768px)',
    });
    expect(input).toHaveStyleRule('border-color', 'transparent', {
      media: '(min-width: 768px)',
    });
  });

  it('renders with search icon on the left', () => {
    render(
      <SearchBox
        inputProps={{
          id: 'searchId',
          label: 'search products',

          value: 'some value',
          onChange: jest.fn,
        }}
        iconPosition="left"
        iconButtonProps={{
          id: 'searchIconBtn',
          buttonAriaLabel: 'Some button',
        }}
      />
    );

    expect(screen.getByLabelText('search products')).toHaveStyleRule(
      'padding-left',
      '2.5rem'
    );
    expect(screen.getByLabelText('Some button')).toHaveStyleRule(
      'left',
      '0.5rem'
    );
  });

  it('renders with search icon on the right by default', () => {
    render(
      <SearchBox
        inputProps={{
          id: 'searchId',
          label: 'search products',
        }}
        iconButtonProps={{
          buttonAriaLabel: 'Some button',
        }}
      />
    );

    expect(screen.getByLabelText('search products')).toHaveStyleRule(
      'padding-right',
      '2.5rem'
    );
    expect(screen.getByLabelText('Some button')).toHaveStyleRule(
      'right',
      '0.5rem'
    );
  });
});
