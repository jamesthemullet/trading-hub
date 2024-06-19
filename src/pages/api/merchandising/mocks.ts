import {
  AttributesResponse,
  BetaMerchandisingFacetListData,
  BoostsBuries,
  BoostsBuriesWithInfo,
  ErrorResponse,
  Facet,
  ProductBoostBury,
  ReturnedCategoryRuleSet,
  ReturnedFacet,
  ReturnedRuleSet,
  RuleSetFacetConfigWithId,
  SearchPreviewResponse,
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
      status: 'included',
      id: 'color-id',
      lastChanged: {
        date: '2021-01-01T08:34:15Z',
        user: 'Test User',
      },
      merged: [],
    },
    {
      displayValue: 'size',
      indexPropertyName: 'size',
      status: 'included',
      id: 'size-id',
      lastChanged: {
        date: '2021-01-02T08:34:15Z',
        user: 'Test User',
      },
      merged: [],
    },
    {
      displayValue: 'brand',
      indexPropertyName: 'brand',
      status: 'included',
      id: 'brand-id',
      lastChanged: {
        date: '2021-01-03T08:34:15Z',
        user: 'Test User',
      },
      merged: [],
    },
    {
      displayValue: 'category',
      indexPropertyName: 'category',
      status: 'included',
      id: 'category-id',
      lastChanged: {
        date: '2021-01-04T08:34:15Z',
        user: 'Test User',
      },
      merged: [],
    },
    {
      displayValue: 'price',
      indexPropertyName: 'price',
      status: 'excluded',
      id: 'price-id',
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
  '/merchandising/ruleset/{category}': {
    get: (_req, status, jsonBody) => {
      const returnedRuleSet = jsonBody as ReturnedRuleSet;
      if (!returnedRuleSet.facets || !returnedRuleSet.facets.length) {
        return {
          body: {
            ...returnedRuleSet,
            facets: ruleSetFacetConfigWithIdMock,
          },
          status: status,
        };
      }
      return { body: jsonBody, status };
    },
  },
  '/search/beta/merchandising/category/ruleset/{ruleSetId}': {
    get: () => {
      return { body: categoryRuleSetMock, status: 200 };
    },
  },
  '/merchandising/category/{category}/preview': {
    post: (_req, status, jsonBody) => {
      const searchPreviewResponse = jsonBody as SearchPreviewResponse;
      /* istanbul ignore next */
      const response: SearchPreviewResponse = {
        ...searchPreviewResponse,
        facets: {
          facets: (!searchPreviewResponse.facets
            ? { facets: { facets: [] as Facet[] } }
            : searchPreviewResponse
          ).facets.facets.map((facet) => ({
            ...facet,
            data: facet.data.map((data) => {
              if ('cat_id' in data) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { cat_id: _delete, ...rest } = data;
                return {
                  ...rest,
                  disabled: false,
                };
              }
              return {
                ...data,
                disabled: false,
              };
            }),
          })),
        },
        rules: searchPreviewResponse.rules,
        pagination: !searchPreviewResponse.pagination
          ? {}
          : searchPreviewResponse.pagination,
      };
      return { body: response, status };
    },
  },
  '/merchandising/facet/{facetId}': {
    get: (req, status, jsonBody) => {
      if (status !== 200) {
        const { url } = req;
        if (!url) {
          const error: ErrorResponse = {
            message: 'url is empty',
            status: '400',
          };
          return { body: error, status: 400 };
        }

        const facetId = url.split('/')[4];
        const facet = globalFacetsListMock.facets.find(
          (facet) => facet.id === facetId
        );

        if (!facet) {
          const error: ErrorResponse = {
            message: `Facet with id: ${facetId} not found`,
            status: '404',
          };
          return { body: error, status: 404 };
        }

        const body: ReturnedFacet = facet;
        return { body, status: 200 };
      }
      return { body: jsonBody, status };
    },
  },
  '/search/beta/merchandising/facet': {
    get: (_req, status, jsonBody) => {
      if (status !== 200) {
        return {
          body: globalFacetsListMock,
          status: 200,
        };
      }
      return { body: jsonBody, status };
    },
  },
  '/search/beta/merchandising/attributes': {
    get: (_req, status, jsonBody) => {
      if (status !== 200) {
        return {
          body: attributesMock,
          status: 200,
        };
      }
      return { body: jsonBody, status };
    },
  },
});
