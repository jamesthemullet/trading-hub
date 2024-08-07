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
        isPinnable
        onSearch={() => {
          return;
        }}
        products={[]}
        pinnedProductsCount={0}
        onChangePosition={mockChangePosition}
        onProductBoostBury={mockProductBoostBury}
      />
    );

    expect(screen.getByPlaceholderText(PLACEHOLDER_TEXT)).toBeInTheDocument();
  });

  it('should render products', () => {
    render(
      <ProductSearch
        isPinnable
        onSearch={() => {
          return;
        }}
        pinnedProductsCount={0}
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

  it('should pin product at position 3', async () => {
    render(
      <ProductSearch
        isPinnable
        pinnedProductsCount={2}
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
          {
            id: '2',
            productId: 'id2',
            title: 'title2',
            imageUrl: ['example2.jpg'],
            brand: 'brand2',
            metadata: { isPinned: false },
            isInStock: true,
            price: '£10',
            url: '',
          },
          {
            id: '3',
            productId: 'id3',
            title: 'title3',
            imageUrl: ['example3.jpg'],
            brand: 'brand3',
            metadata: { isPinned: false },
            isInStock: true,
            price: '£15',
            url: '',
          },
        ]}
        onChangePosition={mockChangePosition}
        onProductBoostBury={mockProductBoostBury}
      />
    );

    const menuButton = screen.getAllByTitle('Open menu')[2];

    await userEvent.click(menuButton);

    const pinButton = screen.getByRole('button', { name: 'Pin in position' });

    await userEvent.click(pinButton);

    const input = screen.getByPlaceholderText('i.e. 3');

    await userEvent.type(input, '3');

    const submitButton = screen.getByText('Confirm');

    await userEvent.click(submitButton);

    expect(mockChangePosition).toHaveBeenCalledWith({
      id: '3',
      isPinned: true,
      newPosition: 2,
    });
  });

  it('should respond to typing', async () => {
    const callback = jest.fn();
    render(
      <ProductSearch
        isPinnable
        pinnedProductsCount={0}
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
