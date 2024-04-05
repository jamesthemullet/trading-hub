import { BoostsBuries } from '../../../libs/api';

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
      id: '1',
      weight: 0.5,
    },
    {
      id: '2',
      weight: 0.5,
    },
  ],
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
  product: [
    {
      id: '2',
      weight: 0.7,
    },
    {
      id: '3',
      weight: 0.3,
    },
  ],
};
