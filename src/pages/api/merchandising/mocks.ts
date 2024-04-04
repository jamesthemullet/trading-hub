import { BoostsBuries, BoostsBuriesWithInfo, ProductBoostBury } from '../../../libs/api';

export const mockProducts: ProductBoostBury[] = [
  {
    id: '2',
    weight: 0.7,
  },
  {
    id: '3',
    weight: 0.3,
  },
]


export const boostMock: BoostsBuries = {
  numeric: [
    {
      field: 'price',
      weight: 0.5,
    },
    {
      field: 'size',
      weight: 0.2,
    },
  ],
  alphaNumeric: [
    {
      field: 'brand',
      weight: 0.5,
      values: ['Nike', 'Adidas'],
    },
    {
      field: 'category',
      weight: 1,
      values: ['Shoes', 'Clothing'],
    },
  ],
  product: [
    {
      id: '1',
      weight: 0.5,
    },
    {
      id: '2',
      weight: 0.5,
    },
  ],
};

export const boostWithInfoMock: BoostsBuriesWithInfo = {
  numeric: boostMock.numeric,
  alphaNumeric: boostMock.alphaNumeric,
  product: mockProducts.map((product, index) => ({
    id: product.id!,
    weight: product.weight!,
    productId: `productId-${index + 1}`,
    title: 'Product title',
    imageUrl: ['example.jpg'],
    brand: 'M&S Collection',
    isInStock: true,
    metadata: { isPinned: false },
    price: '10',
    rating: 4,
    url: '',
  })),
};

export const buriesMock: BoostsBuries = {
  numeric: [
    {
      field: 'price',
      weight: 0.7,
    },
    {
      field: 'size',
      weight: 0.2,
    },
  ],
  alphaNumeric: [
    {
      field: 'brand',
      weight: 0.7,
      values: ['Puma', 'Reebok'],
    },
    {
      field: 'category',
      weight: 0.7,
      values: ['Accessories', 'Clothing'],
    },
  ],
  product: mockProducts,
};

export const buriesWithInfoMock: BoostsBuriesWithInfo = {
  numeric: buriesMock.numeric,
  alphaNumeric: buriesMock.alphaNumeric,
  product: mockProducts.map((product, index) => ({
    id: product.id!,
    weight: product.weight!,
    productId: `productId-${index + 1}`,
    title: 'Product title',
    imageUrl: ['example.jpg'],
    brand: 'M&S Collection',
    isInStock: true,
    metadata: { isPinned: false },
    price: '10',
    rating: 4,
    url: '',
  })),
};
