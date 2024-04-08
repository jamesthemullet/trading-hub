import { renderHook, waitFor } from '@testing-library/react';
import { useAttributes } from './use-attributes';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { AttributesResponse } from '../api';

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
  http.get(`${baseUrl}/merchandising/category/TestCategory/attributes`, () => {
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

  describe('useAttributes', () => {
    it('should return attributes', async () => {
      const category = 'TestCategory';
      const { result } = renderHook(() => useAttributes(category));
      await waitFor(() => {
        expect(result.current.attributes).toEqual(mockedResponse.attributes);
      });
    });

    it('should return empty attributes when category is not provided', async () => {
      const category = undefined;
      const { result } = renderHook(() => useAttributes(category));
      await waitFor(() => {
        expect(result.current.attributes).toEqual([]);
      });
    });
  });
});
