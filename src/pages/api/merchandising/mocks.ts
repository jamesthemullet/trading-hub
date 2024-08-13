import {
  AttributesResponse,
  AttributeValuesResponse,
  BetaMerchandisingFacetListData,
  BoostsBuries,
  BoostsBuriesWithInfo,
  ErrorResponse,
  KeywordRedirect,
  ProductBoostBury,
  ReturnedCategoryRuleSet,
  ReturnedFacet,
  ReturnedKeywordRedirect,
  ReturnedKeywordRuleSet,
  ReturnedKeywordRuleSets,
  ReturnedRuleSet,
  RuleSetFacetConfigWithId,
  SearchPreviewResponseBeta,
} from '@/libs/api';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { NextApiRequest } from 'next';

import { mockSocks } from './mock-socks';

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
      status: 'excluded',
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
      status: 'included',
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
      status: 'included',
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
      status: 'excluded',
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

export const keywordRulesetMock: ReturnedKeywordRuleSets = {
  ruleSets: [
    {
      id: 'abcdcae5-c3c4-455b-aeff-b7d2af65b702',
      rules: mockMerchandisingRules,
      isEnabled: true,
      searchTerms: ['sock', 'socks', 'sockz'],
      lastChanged: {
        date: '2021-01-05T08:34:15Z',
        user: 'Test User',
      },
    },
    {
      id: 'efghcae5-c3c4-455b-aeff-b7d2af65b702',
      rules: mockMerchandisingRules,
      isEnabled: true,
      searchTerms: [
        'Lorem',
        'ipsum',
        'dolor',
        'sit',
        'amet',
        'consectetur',
        'adipiscing',
        'elit,',
        'sed',
        'do',
        'eiusmod',
        'tempor',
        'incididunt',
        'ut',
        'labore',
        'et',
        'dolore',
        'magna',
        'aliqua',
      ],
      lastChanged: {
        date: '2021-07-05T08:34:15Z',
        user: 'Test User',
      },
    },
  ] as Array<ReturnedKeywordRuleSet>,
  pagination: {
    totalItems: 2,
  },
};

export const redirectMock: KeywordRedirect = {
  destinationUrl: 'l/women/dresses',
  endDate: '2024-08-01T09:37:06.109Z',
  isEnabled: true,
  keywords: ['keyword'],
  ruleTitle: 'title of redirect',
  startDate: '2024-08-01T09:37:06.109Z',
  type: 'redirectTerm',
};

export const returnedRedirectMock: ReturnedKeywordRedirect = {
  ...redirectMock,
  id: '9a32d206-6b7f-47a2-8f83-578429d2a024',
  lastChanged: {
    date: '2024-08-01T09:37:06.109Z',
    user: 'string',
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
  '/search/beta/merchandising/facet/{facetId}/attributeValues': {
    get: (_req, status, jsonBody) => {
      if (status !== 200) {
        return {
          body: {
            values: attributeValuesMock,
            pagination: {
              totalItems: 5,
            },
          },
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
  '/search/beta/merchandising/preview': {
    post: (_req, status, jsonBody) => {
      if (status !== 200) {
        const preview: SearchPreviewResponseBeta = {
          products: mockSocks,
          facets: [],
          category: 'should be optional in api',
          ruleSet: {
            facets: [],
            rules: {
              boosts: { product: [], alphanumeric: [], numeric: [] },
              buries: { product: [], alphanumeric: [], numeric: [] },
              pinnedProducts: [],
            },
          },
          pagination: {
            totalItems: 1,
          },
          externalChanges: {
            boosts: { product: [], alphanumeric: [], numeric: [] },
            buries: { product: [], alphanumeric: [], numeric: [] },
            pinnedProducts: [],
          },
        };

        return {
          body: preview,
          status: 200,
        };
      }
      return { body: jsonBody, status };
    },
  },
  '/search/beta/merchandising/keyword/ruleset': {
    get: (_req, status, jsonBody) => {
      if (status !== 200) {
        return {
          body: keywordRulesetMock,
          status: 200,
        };
      }
      return { body: jsonBody, status };
    },
    post: () => {
      return { body: keywordRulesetMock.ruleSets[0], status: 200 };
    },
  },
  '/search/beta/merchandising/keyword/redirect': {
    post: () => {
      return {
        body: returnedRedirectMock,
        status: 200,
      };
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
  '/search/beta/merchandising/keyword/ruleset/{ruleSetId}': {
    put: () => {
      return {
        body: keywordRulesetMock.ruleSets[0],
        status: 200,
      };
    },
    delete: () => {
      return {
        body: {},
        status: 200,
      };
    },
    get: (req) => {
      const { url } = req;

      // istanbul ignore next
      if (!url) {
        const error: ErrorResponse = {
          message: 'url is empty',
          status: '400',
        };
        return { body: error, status: 400 };
      }

      const rulsetId = url.split('/')[7];

      const ruleSet = keywordRulesetMock.ruleSets.find(
        (ruleset) => ruleset.id === rulsetId
      );

      return {
        body: ruleSet || keywordRulesetMock.ruleSets[0],
        status: 200,
      };
    },
  },
});
