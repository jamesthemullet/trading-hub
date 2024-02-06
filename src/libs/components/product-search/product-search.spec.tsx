import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductSearch } from './product-search';

describe('ProductSearch', () => {
  it('should render rules search', () => {
    render(
      <ProductSearch
        onSearch={() => {
          return;
        }}
        products={[]}
        onChangePosition={() => {
          return;
        }}
      />
    );

    expect(screen.getByPlaceholderText(/Search\.\.\./i)).toBeInTheDocument();
  });

  it('should render products', () => {
    render(
      <ProductSearch
        onSearch={() => {
          return;
        }}
        products={[
          {
            id: '1',
            title: 'title',
            imageUrl: ['example1.jpg'],
            brand: 'brand',
            metadata: { isPinned: false },
            isInStock: true,
            price: '£5',
            rating: 4.5,
            url: '',
          },
        ]}
        onChangePosition={() => {
          return;
        }}
      />
    );

    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/brand/i)).toBeInTheDocument();
    expect(screen.getByText(/£5/i)).toBeInTheDocument();
  });

  it('should respond to typing', async () => {
    const callback = jest.fn();
    render(
      <ProductSearch
        onSearch={callback}
        products={[
          {
            id: '1',
            title: 'title',
            imageUrl: ['example1.jpg'],
            brand: 'brand',
            metadata: { isPinned: false },
            isInStock: true,
            price: '£5',
            rating: 4.5,
            url: '',
          },
        ]}
        onChangePosition={() => {
          return;
        }}
      />
    );

    const search = screen.getByPlaceholderText(
      /Search\.\.\./i
    ) as HTMLInputElement;

    search.focus();

    await userEvent.type(search, '123');

    expect(callback).toHaveBeenCalledWith('123');
  });
});
