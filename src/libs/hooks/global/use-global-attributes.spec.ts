import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { AttributesResponse } from '@/libs/api';

import { useGlobalAttributes } from './use-global-attributes';

const baseUrl = 'http://localhost';

const mockedResponse: AttributesResponse = {
  attributes: [
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
  ],
};

const server = setupServer(
  http.get(`${baseUrl}/search/beta/merchandising/attributes`, () => {
    return HttpResponse.json(mockedResponse);
  })
);

describe('use-attributes', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  describe('useGlobalAttributes', () => {
    it('should return attributes', async () => {
      const { result } = renderHook(() => useGlobalAttributes());
      await waitFor(() => {
        expect(result.current.attributes).toEqual(mockedResponse.attributes);
      });
    });

    it('should return attributes by type', async () => {
      const { result } = renderHook(() => useGlobalAttributes('alphanumeric'));
      await waitFor(() => {
        expect(result.current.attributes).toEqual([]);
      });
    });

    it('should return errors', async () => {
      server.use(
        http.get(`${baseUrl}/search/beta/merchandising/attributes`, () => {
          return HttpResponse.error();
        })
      );
      const { result } = renderHook(() => useGlobalAttributes());

      await waitFor(() => {
        expect(result.current.error).toBe('Error fetching attributes');
      });
    });
  });
});
