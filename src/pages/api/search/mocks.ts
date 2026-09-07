// istanbul ignore file
import type {
  GetGlobalFacetsData,
  MerchandisingAttributeValuesResponse,
  MerchandisingBoostsBuries,
  MerchandisingIncludesExcludes,
  MerchandisingKeywordRedirect,
  MerchandisingProductBoostBury,
  MerchandisingReturnedKeywordRedirect,
} from '@/libs/api';

const mockProducts: MerchandisingProductBoostBury[] = [
  {
    id: '2',
    weight: 0.7,
  },
  {
    id: '3',
    weight: 0.3,
  },
];

export const boostMock: MerchandisingBoostsBuries = {
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

export const buriesMock: MerchandisingBoostsBuries = {
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

export const includesMock: MerchandisingIncludesExcludes = {
  alphanumeric: [
    {
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
};

export const excludesMock: MerchandisingIncludesExcludes = {
  alphanumeric: [
    {
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
};

export const facetsListMock: GetGlobalFacetsData = {
  facets: [
    {
      displayValue: 'color',
      indexPropertyName: 'color',
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
      lastChanged: {
        date: '2021-01-01T08:34:15Z',
        user: 'Test User',
      },
      merged: [
        {
          displayValue: 'test merged group',
          mergedValues: ['merged 1', 'merged 2'],
        },
      ],
      type: 'root',
      boosted: ['Cotton', 'Duck Down'],
      excludedValues: ['Ducky Downy'],
    },
    {
      type: 'root',
      displayValue: 'size',
      indexPropertyName: 'size',
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
      lastChanged: {
        date: '2021-01-02T08:34:15Z',
        user: 'Test User',
      },
      merged: [],
    },
    {
      type: 'root',
      displayValue: 'brand',
      indexPropertyName: 'brand',
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
      lastChanged: {
        date: '2021-01-03T08:34:15Z',
        user: 'Test User',
      },
      merged: [],
    },
    {
      type: 'root',
      displayValue: 'category',
      indexPropertyName: 'category',
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a87',
      lastChanged: {
        date: '2021-01-04T08:34:15Z',
        user: 'Test User',
      },
      merged: [],
    },
    {
      type: 'root',
      displayValue: 'price',
      indexPropertyName: 'price',
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
      lastChanged: {
        date: '2021-01-05T08:34:15Z',
        user: 'Test User',
      },
      merged: [],
    },
  ],
};

export const attributeValuesMock: MerchandisingAttributeValuesResponse['values'] =
  [
    {
      displayValue: 'Cotton',
    },
    {
      displayValue: 'Duck Down',
    },
    {
      displayValue: 'Duck Down And Feather',
    },
    {
      displayValue: 'Ducky Downy',
    },
    {
      displayValue: 'Ducky Downy And Feathery',
    },
    {
      displayValue: 'Silk',
    },
    {
      displayValue: 'Merged 1',
    },
    {
      displayValue: 'Merged 2',
    },
    {
      displayValue: 'Other Merged 1',
    },
    {
      displayValue: 'Other Merged 2',
    },
    {
      displayValue: 'More Silk',
    },
  ];

export const redirectMock: MerchandisingKeywordRedirect = {
  destinationUrl: 'l/women/dresses',
  endDate: '2024-08-01T09:37:06.109Z',
  isEnabled: true,
  keywords: ['dress', 'dresses'],
  ruleTitle: 'title of redirect',
  startDate: '2024-08-01T09:37:06.109Z',
  type: 'redirectTerm',
};

export const returnedRedirectMock: MerchandisingReturnedKeywordRedirect = {
  ...redirectMock,
  id: '9a32d206-6b7f-47a2-8f83-578429d2a024',
  lastChanged: {
    date: '2024-08-01T09:37:06.109Z',
    user: 'Jo Smith',
  },
};
