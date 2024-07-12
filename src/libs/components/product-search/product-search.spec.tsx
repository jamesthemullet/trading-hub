import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductSearch } from './product-search';

const PLACEHOLDER_TEXT = 'Search for product';

const mockChangePosition = jest.fn();
const mockProductBoostBury = jest.fn();

describe('ProductSearch', () => {
  it('should render rules search', () => {
    render(
      <ProductSearch
        onSearch={() => {
          return;
        }}
        products={[]}
        onChangePosition={mockChangePosition}
        onProductBoostBury={mockProductBoostBury}
      />
    );

    expect(screen.getByPlaceholderText(PLACEHOLDER_TEXT)).toBeInTheDocument();
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
            productId: 'id1',
            title: 'title',
            imageUrl: ['example1.jpg'],
            brand: 'brand',
            metadata: { isPinned: false },
            isInStock: true,
            price: '£5',
            url: '',
          },
        ]}
        onChangePosition={mockChangePosition}
        onProductBoostBury={mockProductBoostBury}
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
            productId: 'id1',
            title: 'title',
            imageUrl: ['example1.jpg'],
            brand: 'brand',
            metadata: { isPinned: false },
            isInStock: true,
            price: '£5',
            url: '',
          },
        ]}
        onChangePosition={mockChangePosition}
        onProductBoostBury={mockProductBoostBury}
      />
    );

    const search = screen.getByPlaceholderText(
      PLACEHOLDER_TEXT
    ) as HTMLInputElement;

    search.focus();

    await userEvent.type(search, '123');

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith('123');
    });
  });
});
