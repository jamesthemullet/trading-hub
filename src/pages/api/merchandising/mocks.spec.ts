import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';

import { getMockMapping, redirectMock, returnedRedirectMock } from './mocks';

describe('mocks', () => {
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
