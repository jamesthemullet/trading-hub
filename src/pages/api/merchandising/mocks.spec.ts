import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';

import { mockSocks } from './mock-socks';
import {
  categoryRuleSetMock,
  getMockMapping,
  keywordRulesetMock,
  redirectMock,
  returnedRedirectMock,
} from './mocks';

describe('mocks', () => {
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
