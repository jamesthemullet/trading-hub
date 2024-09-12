import {
  AttributesResponse,
  AttributeValuesResponse,
  BetaMerchandisingFacetListData,
  BoostsBuries,
  BoostsBuriesWithInfo,
  KeywordRedirect,
  ProductBoostBury,
  ReturnedCategoryRuleSet,
  ReturnedKeywordRedirect,
  ReturnedKeywordRedirects,
  RuleSetFacetConfigWithId,
} from '@/libs/api';

import { NextApiRequest } from 'next';

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
    url: '',
  })),
};

export const ruleSetFacetConfigWithIdMock: RuleSetFacetConfigWithId[] = [
  {
    id: 'color-id',
    boosted: [],
    excludedValues: [],
  },
  {
    id: 'size-id',
    boosted: [],
    excludedValues: [],
  },
  {
    id: 'brand-id',
    boosted: [],
    excludedValues: [],
  },
  {
    id: 'category-id',
    boosted: [],
    excludedValues: [],
  },
  {
    id: 'price-id',
    boosted: [],
    excludedValues: [],
  },
];

export const globalFacetsListMock: BetaMerchandisingFacetListData = {
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
    },
    {
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

export const categoryRuleSetMock: ReturnedCategoryRuleSet = {
  id: 'abc123',
  categoryName: 'color',
  categoryId: 'color-id',
  categoriesInfo: [
    {
      id: 'foo00',
    },
  ],
  lastChanged: {
    date: '2021-01-05T08:34:15Z',
    user: 'Test User',
  },
  isEnabled: true,
  rules: {
    pinnedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    blockedProducts: [],
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  facets: [
    {
      id: 'color-id',
    },
  ],
};

export const attributesMock: AttributesResponse = {
  attributes: [
    {
      type: 'alphanumeric',
      name: 'Cotton',
    },
    {
      type: 'alphanumeric',
      name: 'Duck Down',
    },
    {
      type: 'alphanumeric',
      name: 'Duck Down And Feather',
    },
    {
      type: 'alphanumeric',
      name: 'Duck Down And Feathery',
    },
    {
      type: 'alphanumeric',
      name: 'Duck Down And Very Feathery',
    },
  ],
};

export const attributeValuesMock: AttributeValuesResponse['values'] = [
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

export const redirectMock: KeywordRedirect = {
  destinationUrl: 'l/women/dresses',
  endDate: '2024-08-01T09:37:06.109Z',
  isEnabled: true,
  keywords: ['dress', 'dresses'],
  ruleTitle: 'title of redirect',
  startDate: '2024-08-01T09:37:06.109Z',
  type: 'redirectTerm',
};

export const returnedRedirectMock: ReturnedKeywordRedirect = {
  ...redirectMock,
  id: '9a32d206-6b7f-47a2-8f83-578429d2a024',
  lastChanged: {
    date: '2024-08-01T09:37:06.109Z',
    user: 'Jo Smith',
  },
};

export const getMockMapping: () => Record<
  string,
  Partial<
    Record<
      'put' | 'post' | 'get' | 'delete',
      (
        req: NextApiRequest,
        status: number,
        jsonBody: object
      ) => { body: object; status: number }
    >
  >
> = () => ({
  '/search/beta/merchandising/keyword/redirect': {
    get: (_req, status, jsonBody) => {
      if (status !== 200) {
        const body: ReturnedKeywordRedirects = {
          redirects: [returnedRedirectMock],
          pagination: {
            totalItems: 1,
          },
        };

        return {
          body,
          status: 200,
        };
      }
      // istanbul ignore next
      return { body: jsonBody, status };
    },
    post: (_req, status, jsonBody) => {
      if (status !== 200) {
        return {
          body: returnedRedirectMock,
          status: 200,
        };
      }
      // istanbul ignore next
      return { body: jsonBody, status };
    },
  },
  '/search/beta/merchandising/keyword/redirect/{redirectId}': {
    get: () => {
      return {
        body: returnedRedirectMock,
        status: 200,
      };
    },
    put: () => {
      return {
        body: returnedRedirectMock,
        status: 200,
      };
    },
  },
});
