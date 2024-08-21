import { ErrorResponse, ReturnedRuleSet } from '@/libs/api';
import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';

import { mockSocks } from './mock-socks';
import {
  attributesMock,
  categoryRuleSetMock,
  getMockMapping,
  globalFacetsListMock,
  keywordRulesetMock,
  redirectMock,
  returnedRedirectMock,
  ruleSetFacetConfigWithIdMock,
} from './mocks';

describe('mocks', () => {
  describe('/merchandising/ruleset/{category}', () => {
    const mockResponse: ReturnedRuleSet = {
      id: '1',
      lastChanged: { date: '', user: '' },
      categoryId: '',
      categoryName: '',
      categoriesInfo: [
        {
          id: '',
        },
      ],
      isEnabled: false,
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: { alphanumeric: [], numeric: [], product: [] },
        buries: { alphanumeric: [], numeric: [], product: [] },
        includes: {
          alphanumeric: [],
        },
        excludes: {
          alphanumeric: [],
        },
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

  describe('/merchandising/facet/{facetId}', () => {
    it('should return globalFacet when status is not 200', () => {
      const id = 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84';
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

  describe('/search/beta/merchandising/attributes', () => {
    it('should return facet attributes when status is not 200', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/attributes'].get
      ).toBeDefined();

      const result = mockMapping['/search/beta/merchandising/attributes'].get!(
        createMockNextApiRequest({
          url: `/search/beta/merchandising/attributes`,
          method: 'GET',
        }),
        400,
        {}
      );
      expect(result).toEqual({
        body: attributesMock,
        status: 200,
      });
    });

    it('should return jsonBody when status is 200', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/attributes'].get
      ).toBeDefined();
      const realResponse = {};

      const result = mockMapping['/search/beta/merchandising/attributes'].get!(
        createMockNextApiRequest({
          url: `/search/beta/merchandising/attributes`,
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

  describe('/search/beta/merchandising/keyword/ruleset', () => {
    it('should return keyword rulesets when status is not 200', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/ruleset'].get
      ).toBeDefined();

      const result = mockMapping['/search/beta/merchandising/keyword/ruleset']
        .get!(
        createMockNextApiRequest({
          url: `/search/beta/merchandising/keyword/ruleset`,
          method: 'GET',
        }),
        400,
        {}
      );
      expect(result).toEqual({
        body: keywordRulesetMock,
        status: 200,
      });
    });

    it('should return jsonBody when status is 200', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/ruleset'].get
      ).toBeDefined();
      const realResponse = {};

      const result = mockMapping['/search/beta/merchandising/keyword/ruleset']
        .get!(
        createMockNextApiRequest({
          url: `/search/beta/merchandising/keyword/ruleset`,
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

    it('should return keyword rulesets when posting to endpoint', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/ruleset'].get
      ).toBeDefined();

      const result = mockMapping['/search/beta/merchandising/keyword/ruleset']
        .post!(
        createMockNextApiRequest({
          url: `/search/beta/merchandising/keyword/ruleset`,
          method: 'GET',
        }),
        400,
        {}
      );
      expect(result).toEqual({
        body: keywordRulesetMock.ruleSets[0],
        status: 200,
      });
    });
  });

  describe('/search/beta/merchandising/keyword/ruleset/{ruleSetId}', () => {
    it('should mock updating rulesets', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/ruleset/{ruleSetId}']
          .put
      ).toBeDefined();

      const result = mockMapping[
        '/search/beta/merchandising/keyword/ruleset/{ruleSetId}'
      ].put!(
        createMockNextApiRequest({
          url: '/search/beta/merchandising/keyword/ruleset/1',
          method: 'PUT',
        }),
        200,
        categoryRuleSetMock
      );
      expect(result).toEqual({
        body: keywordRulesetMock.ruleSets[0],
        status: 200,
      });
    });

    it('should return mock rulesets', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/ruleset/{ruleSetId}']
          .get
      ).toBeDefined();

      const result = mockMapping[
        '/search/beta/merchandising/keyword/ruleset/{ruleSetId}'
      ].get!(
        createMockNextApiRequest({
          url: '/merchandising/keyword/1',
          method: 'GET',
        }),
        200,
        keywordRulesetMock
      );
      expect(result).toEqual({
        body: {
          ...keywordRulesetMock.ruleSets[0],
        },
        status: 200,
      });
    });

    it('should mock delete rulesets', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/ruleset/{ruleSetId}']
          .delete
      ).toBeDefined();

      const result = mockMapping[
        '/search/beta/merchandising/keyword/ruleset/{ruleSetId}'
      ].delete!(
        createMockNextApiRequest({
          url: '/merchandising/keyword/1',
          method: 'GET',
        }),
        200,
        keywordRulesetMock
      );
      expect(result).toEqual({
        body: {},
        status: 200,
      });
    });
  });

  describe('/search/beta/merchandising/preview', () => {
    it('should mock preview', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/preview'].post
      ).toBeDefined();

      const result = mockMapping['/search/beta/merchandising/preview'].post!(
        createMockNextApiRequest({
          url: '/search/beta/merchandising/preview',
          method: 'POST',
        }),
        500,
        {
          products: [],
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
          },
        }
      );
      expect(result).toEqual({
        body: {
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
        },
        status: 200,
      });
    });

    it('should not mock when endpoint is working', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/preview'].post
      ).toBeDefined();

      const result = mockMapping['/search/beta/merchandising/preview'].post!(
        createMockNextApiRequest({
          url: '/search/beta/merchandising/preview',
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
        },
        status: 200,
      });
    });
  });

  describe('/search/beta/merchandising/keyword/redirect', () => {
    it('should mock creating a redirect', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/redirect'].post
      ).toBeDefined();

      const result = mockMapping['/search/beta/merchandising/keyword/redirect']
        .post!(
        createMockNextApiRequest({
          url: '/search/beta/merchandising/keyword/redirect',
          method: 'POST',
        }),
        500,
        redirectMock
      );
      expect(result).toEqual({
        body: returnedRedirectMock,
        status: 200,
      });
    });

    it('should mock getting redirects', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/redirect'].post
      ).toBeDefined();

      const result = mockMapping['/search/beta/merchandising/keyword/redirect']
        .get!(
        createMockNextApiRequest({
          url: '/search/beta/merchandising/keyword/redirect',
          method: 'GET',
        }),
        500,
        redirectMock
      );
      expect(result).toEqual({
        body: {
          pagination: {
            totalItems: 1,
          },
          redirects: [returnedRedirectMock],
        },
        status: 200,
      });
    });
  });

  describe('/search/beta/merchandising/keyword/redirect/{redirectid}', () => {
    it('should mock updating redirects', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/redirect/{redirectId}']
          .put
      ).toBeDefined();

      const result = mockMapping[
        '/search/beta/merchandising/keyword/redirect/{redirectId}'
      ].put!(
        createMockNextApiRequest({
          url: '/search/beta/merchandising/keyword/redirect/1',
          method: 'PUT',
        }),
        200,
        returnedRedirectMock
      );
      expect(result).toEqual({
        body: returnedRedirectMock,
        status: 200,
      });
    });

    it('should return mock redirects', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/search/beta/merchandising/keyword/redirect/{redirectId}']
          .get
      ).toBeDefined();

      const result = mockMapping[
        '/search/beta/merchandising/keyword/redirect/{redirectId}'
      ].get!(
        createMockNextApiRequest({
          url: '/merchandising/keyword/1',
          method: 'GET',
        }),
        200,
        returnedRedirectMock
      );
      expect(result).toEqual({
        body: returnedRedirectMock,
        status: 200,
      });
    });
  });
});
