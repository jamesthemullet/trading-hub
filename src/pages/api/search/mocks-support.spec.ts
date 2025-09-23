import rawApi from '@/libs/api/api.yml';
import { createMockNextApiRequest } from '@/test/create-mock-next-api-request';

import { getMockMapping } from './mocks';
import {
  matchPaths,
  printValidationError,
  validateAndMockResponse,
} from './mocks-support';

const baseUrl = 'https://merch';

jest.mock('@/libs/api/api.yml', () => ({}));
jest.mock('./mocks', () => ({
  getMockMapping: jest.fn(),
}));

describe('mocks support', () => {
  describe('validateAndMockResponse', () => {
    beforeAll(() => {
      process.env.MERCHANDISING_API_BASEURL = baseUrl;
    });

    beforeEach(() => {
      jest.resetModules();
      jest.resetAllMocks();
      const mockedRawApi = jest.mocked(rawApi);
      mockedRawApi.paths = {
        '/merchandising/category/{categoryId}/preview': {
          post: {
            responses: {
              200: {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/TestResponse',
                    },
                  },
                },
              },
            },
          },
        },
      } as any;
      mockedRawApi.components = {
        schemas: {
          TestResponse: {
            type: 'object',
            properties: {
              foo: {
                type: 'string',
              },
            },
            required: ['foo'],
            additionalProperties: false,
          },
        },
      } as any;
    });

    it('should return error when no url or method found in request', () => {
      const result = validateAndMockResponse(
        createMockNextApiRequest({
          url: undefined,
          method: undefined,
        }),
        200,
        {}
      );
      expect(result).toEqual({ error: 'No url or method found in request' });
    });

    it('should return error when request not in API', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = validateAndMockResponse(
        createMockNextApiRequest({
          url: '/petite-round-neck-cardigan/p/clp60275023',
          method: 'GET',
        }),
        200,
        {}
      );
      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toEqual({
        error: 'Server API non compatible and no mock found.',
      });
    });

    it('should find mock but mock is invalid', () => {
      jest.mocked(getMockMapping).mockReturnValueOnce({
        ['/merchandising/category/{categoryId}/preview']: {
          post: () => {
            return {
              bar: 1,
            };
          },
        } as any,
      });
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = validateAndMockResponse(
        createMockNextApiRequest({
          url: '/merchandising/category/1/preview',
          method: 'POST',
        }),
        200,
        { foo: 1 }
      );
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual({ error: 'Mock for server API is invalid.' });
    });

    it('should find no mock for request', () => {
      jest.mocked(getMockMapping).mockReturnValue({});
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = validateAndMockResponse(
        createMockNextApiRequest({
          url: '/merchandising/category/1/preview',
          method: 'POST',
        }),
        200,
        { foo: 1 }
      );
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual({
        error:
          'Server API non compatible and no mock found. in foo: must be string',
      });
    });

    it('should update response object', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.mocked(getMockMapping).mockReturnValue({
        ['/merchandising/category/{categoryId}/preview']: {
          post: () => {
            return {
              body: {
                foo: '2',
              },
              status: 200,
            };
          },
        },
      });
      const result = validateAndMockResponse(
        createMockNextApiRequest({
          url: '/merchandising/category/1/preview',
          method: 'POST',
        }),
        200,
        { foo: 1 }
      );
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toEqual({
        updatedJsonBody: { foo: '2' },
        updatedStatus: 200,
      });
    });

    it('should warn about mock not being needed, but still apply mock', () => {
      jest.mocked(getMockMapping).mockReturnValue({
        ['/merchandising/category/{categoryId}/preview']: {
          post: () => {
            return {
              body: {
                foo: '2',
              },
              status: 200,
            };
          },
        },
      });
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = validateAndMockResponse(
        createMockNextApiRequest({
          url: '/merchandising/category/1/preview',
          method: 'POST',
        }),
        200,
        { foo: '1' }
      ); // response is valid
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'WARNING: Mock for POST /merchandising/category/1/preview found but server response is valid. Please remove mock for /merchandising/category/1/preview'
      );
      expect(result).toEqual({
        updatedJsonBody: {
          foo: '2',
        },
        updatedStatus: 200,
      });
    });

    it('should work when the API schema matches and there is no mock', () => {
      jest.mocked(getMockMapping).mockReturnValue({});
      const result = validateAndMockResponse(
        createMockNextApiRequest({
          url: '/merchandising/category/1/preview',
          method: 'POST',
        }),
        200,
        { foo: '1' }
      );
      expect(result).toEqual({
        updatedJsonBody: { foo: '1' },
        updatedStatus: 200,
      });
    });
  });

  describe('matchPaths', () => {
    it('should match paths', () => {
      const result = matchPaths('/merchandising/category/1/preview')(
        '/merchandising/category/{category}/preview'
      );
      expect(result).toEqual(true);
    });

    it('should not match paths', () => {
      const result = matchPaths('/merchandising/category/1/preview')(
        '/merchandising/category/2/preview'
      );
      expect(result).toEqual(false);
    });
  });

  describe('printValidationError', () => {
    it('should print validation error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      printValidationError({
        message: 'error',
        errors: [
          {
            path: 'path',
            message: 'message',
          },
        ],
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
