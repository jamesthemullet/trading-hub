import {
  AttributeResponseItem,
  BoostsBuries,
  BoostsBuriesWithInfo,
  ProductBoostBury,
  SearchPreviewResponse,
  AttributesResponse,
  Facet,
  FacetsList,
  ReturnedFacet,
  ErrorResponse,
  ReturnedRuleSet,
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

export const attributesResponseMock: AttributesResponse = {
  attributes: attributesMock,
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

export const globalFacetsListMock: FacetsList = {
  facets: [
    {
      displayValue: 'color',
      indexPropertyName: 'color',
      id: 'color-id',
      lastChanged: {
        date: '2021-01-01T08:34:15Z',
        user: 'Test User',
      },
    },
    {
      displayValue: 'size',
      indexPropertyName: 'size',
      id: 'size-id',
      lastChanged: {
        date: '2021-01-02T08:34:15Z',
        user: 'Test User',
      },
    },
    {
      displayValue: 'brand',
      indexPropertyName: 'brand',
      id: 'brand-id',
      lastChanged: {
        date: '2021-01-03T08:34:15Z',
        user: 'Test User',
      },
    },
    {
      displayValue: 'category',
      indexPropertyName: 'category',
      id: 'category-id',
      lastChanged: {
        date: '2021-01-04T08:34:15Z',
        user: 'Test User',
      },
    },
    {
      displayValue: 'price',
      indexPropertyName: 'price',
      id: 'price-id',
      lastChanged: {
        date: '2021-01-05T08:34:15Z',
        user: 'Test User',
      },
    },
  ],
};

export const getMockMapping: () => Record<
  string,
  Partial<
    Record<
      'post' | 'get' | 'delete',
      (
        req: NextApiRequest,
        status: number,
        jsonBody: object
      ) => { body: object; status: number }
    >
  >
> = () => ({
  '/merchandising/attributes': {
    get: (_req, status, jsonBody) => {
      if (status !== 200) {
        return { body: attributesResponseMock, status: 200 };
      }
      return { body: jsonBody, status };
    },
  },
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
  '/merchandising/category/{category}/preview': {
    post: (_req, status, jsonBody) => {
      const searchPreviewResponse = jsonBody as SearchPreviewResponse;
      /* istanbul ignore next */
      const response: SearchPreviewResponse = {
        ...searchPreviewResponse,
        products: searchPreviewResponse.products.map((product) => ({
          ...product,
          brand: product.brand || 'M&S',
        })),
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
        rules: {
          ...searchPreviewResponse.rules,
          pinnedProducts: searchPreviewResponse.rules.pinnedProducts.map(
            (product) => ({
              id: product.id,
              productId: product.productId || '0000',
              metadata: {
                isPinned: true,
              },
              url: product.url || 'mands.com',
              price: product.price || '£XX',
              imageUrl: product.imageUrl || [''],
              title: product.title || '(Missing preview data)',
              brand: product.brand || 'M&S',
              isInStock: true,
            })
          ),
          boosts: {
            ...searchPreviewResponse.rules.boosts,
            product: searchPreviewResponse.rules.boosts.product.map(
              (product) => ({
                id: product.id,
                weight: product.weight || 0.1,
                productId: product.productId || product.id || '0000',
                metadata: {
                  isPinned: false,
                  isBoosted: true,
                },
                url: product.url || 'mands.com',
                price: product.price || '£XX',
                imageUrl: product.imageUrl || [''],
                title: product.title || '(Missing preview data)',
                brand: product.brand || 'M&S',
                isInStock: true,
              })
            ),
          },
          buries: {
            ...searchPreviewResponse.rules.buries,
            product: searchPreviewResponse.rules.buries.product.map(
              (product) => ({
                id: product.id,
                weight: product.weight || 0.1,
                productId: product.productId || product.id || '0000',
                metadata: {
                  isPinned: false,
                  isBuried: true,
                },
                url: product.url || 'mands.com',
                price: product.price || '£XX',
                imageUrl: product.imageUrl || [''],
                title: product.title || '(Missing preview data)',
                brand: product.brand || 'M&S',
                isInStock: true,
              })
            ),
          },
          blockedProducts: searchPreviewResponse.rules.blockedProducts
            ? searchPreviewResponse.rules.blockedProducts.map((product) => ({
                id: product.id,
                productId: product.productId || product.id || '0000',
                metadata: {
                  isPinned: false,
                  isBlocked: true,
                },
                url: product.url || 'mands.com',
                price: product.price || '£XX',
                imageUrl: product.imageUrl || [''],
                title: product.title || '(Missing preview data)',
                brand: product.brand || 'M&S',
                isInStock: true,
              }))
            : [],
        },
        pagination: !searchPreviewResponse.pagination
          ? {}
          : searchPreviewResponse.pagination,
      };
      return { body: response, status };
    },
  },
  '/merchandising/facet': {
    get: (_req, status, jsonBody) => {
      if (status !== 200) {
        return { body: globalFacetsListMock, status: 200 };
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
});
