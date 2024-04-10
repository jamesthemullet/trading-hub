import {
  AttributeResponseItem,
  BoostsBuries,
  BoostsBuriesWithInfo,
  ProductBoostBury,
} from '../../../libs/api';

export const mockProducts: ProductBoostBury[] = [
  {
    id: '2',
    weight: 0.7,
  },
  {
    id: '3',
    weight: 0.3,
  },
];

export const boostMock: BoostsBuries = {
  numeric: [
    {
      field: 'averageRating',
      weight: 0.5,
    },
    {
      field: 'minPrice',
      weight: 0.2,
    },
  ],
  alphanumeric: [
    {
      weight: 0.5,
      fields: [
        {
          field: 'brand',
          values: ['Nike', 'Adidas'],
        },
        {
          field: 'category',
          values: ['Shoes', 'Clothing'],
        },
      ],
    },
  ],
  product: [
    {
      id: '60449386',
      weight: 1,
    },
    {
      id: '2',
      weight: 0.5,
    },
  ],
};

export const boostWithInfoMock: BoostsBuriesWithInfo = {
  numeric: boostMock.numeric,
  alphanumeric: boostMock.alphanumeric,
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
      field: 'daysSinceLaunch',
      weight: 0.7,
    },
    {
      field: 'maxPrice',
      weight: 0.2,
    },
  ],
  alphanumeric: [
    {
      weight: 0.7,
      fields: [
        {
          field: 'brand',
          values: ['Puma', 'Reebok'],
        },
        {
          field: 'category',
          values: ['Accessories', 'Clothing'],
        },
      ],
    },
  ],
  product: mockProducts,
};

export const buriesWithInfoMock: BoostsBuriesWithInfo = {
  numeric: buriesMock.numeric,
  alphanumeric: buriesMock.alphanumeric,
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

export const attributesMock: AttributeResponseItem[] = [
  {
    type: 'alphanumeric',
    name: 'Colour',
    values: [{ value: 'Red' }, { value: 'Blue' }, { value: 'Green' }],
  },
  {
    type: 'numeric',
    name: 'Size',
    values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }],
  },
  {
    type: 'alphanumeric',
    name: 'Brand',
    values: [{ value: 'Nike' }, { value: 'Adidas' }, { value: 'Puma' }],
  },
  {
    type: 'alphanumeric',
    name: 'Category',
    values: [
      { value: 'Shoes' },
      { value: 'Clothing' },
      { value: 'Accessories' },
    ],
  },
  {
    type: 'numeric',
    name: 'Price',
    values: [
      { value: '0-50' },
      { value: '50-100' },
      { value: '100-200' },
      { value: '200+' },
    ],
  },
];
