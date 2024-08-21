import { MerchandisingRules } from '@/libs/api';

export const mockMerchandisingRulesWithData: MerchandisingRules = {
  pinnedProducts: [
    {
      id: '60183702',
    },
    {
      id: '60290408',
    },
    {
      id: '60169259',
    },
  ],
  blockedProducts: [],
  boosts: {
    numeric: [
      {
        field: 'newInFreshNess',
        weight: 100,
      },
    ],
    alphanumeric: [
      {
        fields: [
          {
            field: 'colour',
            values: ['Grey'],
          },
        ],
        weight: 100,
      },
    ],
    product: [],
  },
  buries: {
    numeric: [
      {
        field: 'maxPrice',
        weight: 100,
      },
    ],
    alphanumeric: [
      {
        fields: [
          {
            field: 'category.name',
            values: ['Thermals'],
          },
        ],
        weight: 100,
      },
    ],
    product: [],
  },
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};

export const mockMerchandisingRules: MerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: {
    numeric: [],
    alphanumeric: [],
    product: [],
  },
  buries: {
    numeric: [],
    alphanumeric: [],
    product: [],
  },
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};
