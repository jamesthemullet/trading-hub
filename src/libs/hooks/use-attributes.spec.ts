import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { AttributesResponse } from '../api';
import { useAttributes } from './use-attributes';

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

const mockedIEResponse: AttributesResponse = {
  attributes: [
    {
      type: 'alphanumeric',
      name: 'Colour',
      values: [{ value: 'Red' }, { value: 'Blue' }, { value: 'Green' }],
    },
    {
      type: 'alphanumeric',
      name: 'styles',
      values: [
        { value: 'Scarves' },
        { value: 'Leather Gloves' },
        { value: 'Beanie' },
      ],
    },
  ],
};

const server = setupServer(
  http.get(
    `${baseUrl}/search/beta/merchandising/attributes`,
    async ({ request }) => {
      const url = new URL(request.url);
      const catalogue = url.searchParams.get('catalogue');

      if (catalogue === 'MANDSIE') {
        return HttpResponse.json(mockedIEResponse);
      }
      return HttpResponse.json(mockedResponse);
    }
  )
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
      const { result } = renderHook(() =>
        useAttributes({ category, countryCode: 'UK' })
      );
      await waitFor(() => {
        expect(result.current.attributes).toEqual(mockedResponse.attributes);
      });
    });

    it('should accept search terms', async () => {
      const searchTerms = ['foo', 'bar'];
      const { result } = renderHook(() =>
        useAttributes({ searchTerms, countryCode: 'UK' })
      );
      await waitFor(() => {
        expect(result.current.attributes).toEqual(mockedResponse.attributes);
      });
    });

    it('should return empty attributes when category is not provided', async () => {
      const category = undefined;
      const { result } = renderHook(() =>
        useAttributes({ category, countryCode: 'UK' })
      );
      await waitFor(() => {
        expect(result.current.attributes).toEqual([]);
      });
    });

    it('should combine UK and IE attributes', async () => {
      const category = 'TestCategory';
      const { result, rerender } = renderHook(() =>
        useAttributes({ category, countryCode: 'UK_IE' })
      );
      await Promise.resolve();

      await waitFor(() => {
        expect(result.current.attributes.length).toEqual(0);
      });

      rerender();

      expect(result.current.attributes.length).toEqual(5);
    });

    it('should return errors when api fails', async () => {
      const category = undefined;
      server.close();
      const { result } = renderHook(() =>
        useAttributes({ category, countryCode: 'UK' })
      );
      await waitFor(() => {
        expect(result.current.fetchError).toEqual(
          'Error: TypeError: fetch failed'
        );
      });
    });
  });
});
