import { ErrorResponse, ReturnedRuleSet } from '@/libs/api';
import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';

import {
  getMockMapping,
  globalFacetsListMock,
  ruleSetFacetConfigWithIdMock,
} from './mocks';

const mockProductData = {
  brand: 'M&S',
  id: '1',
  imageUrl: [''],
  isInStock: true,
  metadata: {
    isPinned: true,
  },
  price: '£XX',
  productId: '0000',
  title: '(Missing preview data)',
  url: 'mands.com',
};

describe('mocks', () => {
  describe('/merchandising/ruleset/{category}', () => {
    const mockResponse: ReturnedRuleSet = {
      id: '1',
      lastChanged: { date: '', user: '' },
      categoryId: '',
      categoryName: '',
      isEnabled: false,
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
      },
    };

    it('should respond with real response for ruleset when status is 200 and real response contain facets', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/merchandising/ruleset/{category}'].get
      ).toBeDefined();

      const result = mockMapping['/merchandising/ruleset/{category}'].get!(
        createMockNextApiRequest({
          url: '/merchandising/ruleset/1',
          method: 'GET',
        }),
        200,
        { mockResponse, facets: [ruleSetFacetConfigWithIdMock[0]] }
      );
      expect(result).toEqual({
        body: { mockResponse, facets: [ruleSetFacetConfigWithIdMock[0]] },
        status: 200,
      });
    });

    it('should add mock facets when response contain facets: undefined', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/merchandising/ruleset/{category}'].get
      ).toBeDefined();

      const result = mockMapping['/merchandising/ruleset/{category}'].get!(
        createMockNextApiRequest({
          url: '/merchandising/ruleset/1',
          method: 'GET',
        }),
        200,
        mockResponse
      );
      expect(result).toEqual({
        body: {
          ...mockResponse,
          facets: ruleSetFacetConfigWithIdMock,
        },
        status: 200,
      });
    });

    it('should add mock facets when response contain facets: []', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/merchandising/ruleset/{category}'].get
      ).toBeDefined();

      const result = mockMapping['/merchandising/ruleset/{category}'].get!(
        createMockNextApiRequest({
          url: '/merchandising/ruleset/1',
          method: 'GET',
        }),
        200,
        { ...mockResponse, facets: [] }
      );
      expect(result).toEqual({
        body: {
          ...mockResponse,
          facets: ruleSetFacetConfigWithIdMock,
        },
        status: 200,
      });
    });
  });

  describe('/merchandising/category/{category}/preview', () => {
    it('should add missing product data when its missing from server side request when making request to /merchandising/category/{category}/preview', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/merchandising/category/{category}/preview'].post
      ).toBeDefined();

      const result = mockMapping['/merchandising/category/{category}/preview']
        .post!(
        createMockNextApiRequest({
          url: '/merchandising/category/1/preview',
          method: 'POST',
        }),
        200,
        {
          products: [
            {
              id: '1',
              // missing rating
              // missing brand
            },
          ],
          facets: {
            facets: [
              {
                id: '1',
                data: [
                  {
                    name: '1',
                    count: 1,
                    selected: false,
                    // missing disabled
                    cat_id: '1', // unexpected property
                  },
                ],
              },
              {
                id: '2',
                data: [
                  {
                    name: '2',
                    count: 1,
                    // missing disabled
                    selected: false,
                    // no cat_id
                  },
                ],
              },
            ],
          },
          rules: {
            pinnedProducts: [
              {
                id: '1',
                // missing rating
              },
            ],
            blockedProducts: [{ id: 'b' }],
            boosts: { numeric: [], alphanumeric: [], product: [{ id: 'c' }] },
            buries: { numeric: [], alphanumeric: [], product: [{ id: 'd' }] },
          },
          pagination: {},
        }
      );
      expect(result).toEqual({
        body: {
          products: [
            {
              id: '1',
              brand: 'M&S',
            },
          ],
          facets: {
            facets: [
              {
                id: '1',
                data: [
                  {
                    name: '1',
                    count: 1,
                    selected: false,
                    disabled: false,
                  },
                ],
              },
              {
                id: '2',
                data: [
                  {
                    name: '2',
                    count: 1,
                    selected: false,
                    disabled: false,
                  },
                ],
              },
            ],
          },
          rules: {
            pinnedProducts: [mockProductData],
            blockedProducts: [
              {
                ...mockProductData,
                id: 'b',
                productId: 'b',
                metadata: { isPinned: false, isBlocked: true },
              },
            ],
            boosts: {
              numeric: [],
              alphanumeric: [],
              product: [
                {
                  ...mockProductData,
                  id: 'c',
                  productId: 'c',
                  weight: 0.1,
                  metadata: { isPinned: false, isBoosted: true },
                },
              ],
            },
            buries: {
              numeric: [],
              alphanumeric: [],
              product: [
                {
                  ...mockProductData,
                  id: 'd',
                  productId: 'd',
                  weight: 0.1,
                  metadata: { isPinned: false, isBuried: true },
                },
              ],
            },
          },
          pagination: {},
        },
        status: 200,
      });
    });

    it('should work when missing facets and pagination', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/merchandising/category/{category}/preview'].post
      ).toBeDefined();

      const result = mockMapping['/merchandising/category/{category}/preview']
        .post!(
        createMockNextApiRequest({
          url: '/merchandising/category/1/preview',
          method: 'POST',
        }),
        200,
        {
          products: [],
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
          },
          // missing facets
          // missing pagination
        }
      );
      expect(result).toEqual({
        body: {
          products: [],
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
          },
          pagination: {},
          facets: {
            facets: [],
          },
        },
        status: 200,
      });
    });
  });

  describe('/merchandising/facet/{facetId}', () => {
    it('should return globalFacet when status is not 200', () => {
      const id = 'color-id';
      const mockMapping = getMockMapping();
      expect(mockMapping['/merchandising/facet/{facetId}'].get).toBeDefined();

      const result = mockMapping['/merchandising/facet/{facetId}'].get!(
        createMockNextApiRequest({
          url: `/api/merchandising/facet/${id}`,
          method: 'GET',
        }),
        400,
        {}
      );
      expect(result).toEqual({
        body: globalFacetsListMock.facets.find((facet) => facet.id === id),
        status: 200,
      });
    });

    it('should not return globalFacet when status is not 200 and url is empty', () => {
      const mockMapping = getMockMapping();
      expect(mockMapping['/merchandising/facet/{facetId}'].get).toBeDefined();

      const result = mockMapping['/merchandising/facet/{facetId}'].get!(
        createMockNextApiRequest({
          url: '',
          method: 'GET',
        }),
        400,
        {}
      );
      const error: ErrorResponse = {
        message: 'url is empty',
        status: '400',
      };
      expect(result).toEqual({
        body: error,
        status: 400,
      });
    });

    it('should not return globalFacet when status is not 200 and id is wrong', () => {
      const id = 'wrong-id';
      const mockMapping = getMockMapping();
      expect(mockMapping['/merchandising/facet/{facetId}'].get).toBeDefined();

      const result = mockMapping['/merchandising/facet/{facetId}'].get!(
        createMockNextApiRequest({
          url: `/api/merchandising/facet/${id}`,
          method: 'GET',
        }),
        400,
        {}
      );
      const error: ErrorResponse = {
        message: `Facet with id: ${id} not found`,
        status: '404',
      };
      expect(result).toEqual({
        body: error,
        status: 404,
      });
    });

    it('should return jsonBody when status is 200', () => {
      const id = 'color-id';
      const mockMapping = getMockMapping();
      expect(mockMapping['/merchandising/facet/{facetId}'].get).toBeDefined();
      const realResponse = {};

      const result = mockMapping['/merchandising/facet/{facetId}'].get!(
        createMockNextApiRequest({
          url: `/api/merchandising/facet/${id}`,
          method: 'GET',
        }),
        200,
        realResponse
      );
      expect(result).toEqual({
        body: realResponse,
        status: 200,
      });
    });
  });

  describe('/search/beta/merchandising/facet', () => {
    it('should return global facets when status is not 200', () => {
      const mockMapping = getMockMapping();
      expect(mockMapping['/search/beta/merchandising/facet'].get).toBeDefined();

      const result = mockMapping['/search/beta/merchandising/facet'].get!(
        createMockNextApiRequest({
          url: `/search/beta/merchandising/facet`,
          method: 'GET',
        }),
        400,
        {}
      );
      expect(result).toEqual({
        body: globalFacetsListMock,
        status: 200,
      });
    });

    it('should return jsonBody when status is 200', () => {
      const mockMapping = getMockMapping();
      expect(mockMapping['/search/beta/merchandising/facet'].get).toBeDefined();
      const realResponse = {};

      const result = mockMapping['/search/beta/merchandising/facet'].get!(
        createMockNextApiRequest({
          url: `/search/beta/merchandising/facet`,
          method: 'GET',
        }),
        200,
        realResponse
      );
      expect(result).toEqual({
        body: realResponse,
        status: 200,
      });
    });
  });
});
