import {
  AttributeResponseItem,
  BoostsBuries,
  BoostsBuriesWithInfo,
  ProductBoostBury,
  ProductSearchResponse,
  SearchPreviewResponse,
  AttributesResponse,
  Facet,
  FacetsList,
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

export const attributesResponseMock: AttributesResponse = {
  attributes: attributesMock,
};

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
  '/merchandising/category/{category}/attributes': {
    get: (_req, status, jsonBody) => {
      if (status !== 200) {
        return { body: attributesResponseMock, status: 200 };
      }
      return { body: jsonBody, status };
    },
  },
  '/merchandising/product': {
    post: (_req, status, jsonBody) => {
      const productSearchResponse = jsonBody as ProductSearchResponse;
      return {
        body: {
          ...productSearchResponse,
          products: productSearchResponse.products.map((product) => ({
            ...product,
            metadata: { isPinned: false },
          })),
        },
        status: status,
      };
    },
  },
  '/merchandising/category/{category}/preview': {
    post: (_req, status, jsonBody) => {
      const searchPreviewResponse = jsonBody as SearchPreviewResponse;
      const response: SearchPreviewResponse = {
        ...searchPreviewResponse,
        products: searchPreviewResponse.products.map((product) => ({
          ...product,
          rating: 1,
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
              ...product,
              rating: 1,
            })
          ),
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
});
