import { render, screen } from '@testing-library/react';

import type { Product } from '../../api';
import { VisualEditor } from './visual-editor';

describe('VisualEditor', () => {
  const product1Id = 'a1';
  const product2Id = 'b2';
  const product3Id = 'c2';
  const product1Title = 'first product';
  const product2Title = 'second product';
  const product3Title = 'third product';
  const product1Brand = 'foo';

  const products: Product[] = [
    {
      id: product1Id,
      productId: product1Id,
      title: product1Title,
      imageUrl: ['example1.jpg'],
      brand: product1Brand,
      metadata: { isPinned: false },
      isInStock: true,
      price: '£10',
      url: '',
    },
    {
      id: product2Id,
      productId: product2Id,
      title: product2Title,
      imageUrl: ['example12.jpg'],
      brand: 'brand',
      metadata: { isPinned: false },
      isInStock: true,
      price: '£50',
      url: '',
    },
    {
      id: product3Id,
      productId: product3Id,
      title: product3Title,
      imageUrl: ['example.jpg'],
      brand: 'M$S',
      metadata: { isPinned: true },
      isInStock: true,
      price: '£15',
      url: '',
    },
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render products', () => {
    render(
      <VisualEditor
        products={products}
        dispatch={jest.fn()}
        hasBulkAction={false}
        onSelectProduct={jest.fn()}
        isSelectionDisabled
        selectedProducts={[]}
      />
    );

    expect(
      screen.getByText(`${product1Brand} ${product1Title}`)
    ).toBeInTheDocument();
  });
});
