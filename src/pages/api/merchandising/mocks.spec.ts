import { createMockNextApiRequest } from '../../../test/create-mock-next-api-request';
import { attributesResponseMock, getMockMapping } from './mocks';

describe('mocks', () => {
  describe('/merchandising/category/{category}/attributes', () => {
    it('should respond with real response for attributes when status is 200', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/merchandising/category/{category}/attributes'].get
      ).toBeDefined();

      const result = mockMapping[
        '/merchandising/category/{category}/attributes'
      ].get!(
        createMockNextApiRequest({
          url: '/merchandising/category/1/attributes',
          method: 'GET',
        }),
        200,
        attributesResponseMock
      );
      expect(result).toEqual({
        body: attributesResponseMock,
        status: 200,
      });
    });

    it('should respond with mock for attributes when status is 400', () => {
      const mockMapping = getMockMapping();
      expect(
        mockMapping['/merchandising/category/{category}/attributes'].get
      ).toBeDefined();

      const result = mockMapping[
        '/merchandising/category/{category}/attributes'
      ].get!(
        createMockNextApiRequest({
          url: '/merchandising/category/1/attributes',
          method: 'GET',
        }),
        400,
        {}
      );
      expect(result).toEqual({
        body: attributesResponseMock,
        status: 200,
      });
    });
  });

  describe('/merchandising/product', () => {
    it('should add missing isPinned when its missing from server side request when making request to /merchandising/product', () => {
      const mockMapping = getMockMapping();
      expect(mockMapping['/merchandising/product'].post).toBeDefined();

      const result = mockMapping['/merchandising/product'].post!(
        createMockNextApiRequest({
          url: '/merchandising/product',
          method: 'POST',
        }),
        200,
        {
          products: [
            {
              brand: 'M&S',
              id: '1',
              metadata: {},
            },
          ],
        }
      );
      expect(result).toEqual({
        body: {
          products: [
            {
              brand: 'M&S',
              id: '1',
              metadata: {
                isPinned: false,
              },
            },
          ],
        },
        status: 200,
      });
    });
  });

  describe('/merchandising/category/{category}/preview', () => {
    it('should add missing rating when its missing from server side request when making request to /merchandising/category/{category}/preview', () => {
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
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
          },
          pagination: {},
        }
      );
      expect(result).toEqual({
        body: {
          products: [
            {
              id: '1',
              rating: 1,
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
            pinnedProducts: [
              {
                id: '1',
                rating: 1,
              },
            ],
            blockedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
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
});
