import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { MerchandisingAttributesResponse } from '../api';
import { useAttributes } from './use-attributes';

const baseUrl = 'http://localhost';

const mockedResponse: MerchandisingAttributesResponse = {
  attributes: [
    {
      type: 'alphanumeric',
      name: 'Colour',
      values: [{ value: 'Red' }, { value: 'Blue' }, { value: 'Green' }],
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
      name: 'fit',
      type: 'alphanumeric',
      values: [
        {
          value: 'Regular fit',
        },
        {
          value: 'Relaxed fit',
        },
        {
          value: 'Tailored fit',
        },
        {
          value: 'Slim fit',
        },
        {
          value: 'Plus fit',
        },
      ],
    },
  ],
};

const mockedNumericResponse: MerchandisingAttributesResponse = {
  attributes: [
    {
      name: 'newInFreshNess',
      type: 'numeric',
    },
    {
      name: 'averageRating',
      type: 'numeric',
    },
  ],
};

const mockedIEResponse: MerchandisingAttributesResponse = {
  attributes: [
    {
      type: 'alphanumeric',
      name: 'Colour',
      values: [{ value: 'Green' }, { value: 'White' }, { value: 'Orange' }],
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
    {
      name: 'fit',
      type: 'alphanumeric',
      values: [
        {
          value: 'Regular fit',
        },
        {
          value: 'Relaxed fit',
        },
        {
          value: 'Fitted',
        },
        {
          value: 'Tailored fit',
        },
        {
          value: 'Plus fit',
        },
        {
          value: 'Slim fit',
        },
        {
          value: 'Straight leg',
        },
      ],
    },
  ],
};

const mockedIENumericResponse: MerchandisingAttributesResponse = {
  attributes: [
    {
      name: 'predictions.salesIn1Day.normalisedValue',
      type: 'numeric',
    },
    {
      name: 'newInFreshNess',
      type: 'numeric',
    },
  ],
};

const mockedCftoResponse: MerchandisingAttributesResponse = {
  attributes: [
    {
      type: 'alphanumeric',
      name: 'CFTO Attribute',
      values: [{ value: 'Foo' }],
    },
  ],
};

const server = setupServer(
  http.get(
    `${baseUrl}/search/merchandising/v1/CLOTHING_AND_HOME/attributes`,
    async ({ request }) => {
      const url = new URL(request.url);
      const country = url.searchParams.get('country');
      const type = url.searchParams.get('type');

      if (country === 'IE') {
        return HttpResponse.json(
          type === 'numeric' ? mockedIENumericResponse : mockedIEResponse
        );
      }
      return HttpResponse.json(
        type === 'numeric' ? mockedNumericResponse : mockedResponse
      );
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
      const categories = ['SubCategory_429'];
      const { result } = renderHook(() =>
        useAttributes({ categories, countryCode: 'UK', type: 'alphanumeric' })
      );
      await waitFor(() => {
        expect(result.current.attributes).toEqual(mockedResponse.attributes);
      });
    });

    it('should accept search terms', async () => {
      const searchTerms = ['foo', 'bar'];
      const { result } = renderHook(() =>
        useAttributes({ searchTerms, countryCode: 'UK', type: 'alphanumeric' })
      );
      await waitFor(() => {
        expect(result.current.attributes).toEqual(mockedResponse.attributes);
      });
    });

    it('should return empty attributes when categories is not provided', async () => {
      const categories = undefined;
      const { result } = renderHook(() =>
        useAttributes({ categories, countryCode: 'UK', type: 'alphanumeric' })
      );
      await waitFor(() => {
        expect(result.current.attributes).toEqual([]);
      });
    });

    it('should request the CFTO catalogue when specified', async () => {
      // Only registered for /v1/CFTO/attributes, so a dropped/ignored catalogue falls through to the CLOTHING_AND_HOME handler and fails this assertion
      server.use(
        http.get(`${baseUrl}/search/merchandising/v1/CFTO/attributes`, () =>
          HttpResponse.json(mockedCftoResponse)
        )
      );

      const categories = ['SubCategory_429'];
      const { result } = renderHook(() =>
        useAttributes({
          categories,
          countryCode: 'UK',
          type: 'alphanumeric',
          catalogue: 'CFTO',
        })
      );
      await waitFor(() => {
        expect(result.current.attributes).toEqual(
          mockedCftoResponse.attributes
        );
      });
    });

    it('should combine UK and IE alphanumeric attributes and values', async () => {
      const categories = ['SubCategory_429', 'IE_SubCategory_789'];
      const expectedCombinedColours = [
        { value: 'Red' },
        { value: 'Blue' },
        { value: 'Green' },
        { value: 'White' },
        { value: 'Orange' },
      ];
      const { result, rerender } = renderHook(() =>
        useAttributes({
          categories,
          countryCode: 'UK_IE',
          type: 'alphanumeric',
        })
      );
      await Promise.resolve();

      await waitFor(() => {
        expect(result.current.attributes.length).toEqual(0);
      });

      rerender();

      expect(result.current.attributes.length).toEqual(5);
      expect(result.current.attributes[0].name).toBe('Colour');
      expect(result.current.attributes[0].values).toHaveLength(5);
      expect(result.current.attributes[0].values).toEqual(
        expectedCombinedColours
      );
      expect(result.current.attributes[1].name).toBe('Brand');
      expect(result.current.attributes[4].name).toBe('styles');
    });

    it('should combine UK and IE numeric attributes', async () => {
      const categories = ['SubCategory_429', 'IE_SubCategory_789'];
      const { result, rerender } = renderHook(() =>
        useAttributes({
          categories,
          countryCode: 'UK_IE',
          type: 'numeric',
        })
      );

      await waitFor(() => {
        expect(result.current.attributes.length).toEqual(0);
      });

      rerender();

      expect(result.current.attributes.length).toEqual(3);
      expect(result.current.attributes[0].name).toBe('newInFreshNess');
      expect(result.current.attributes[2].name).toBe(
        'predictions.salesIn1Day.normalisedValue'
      );
    });

    it('should return errors when api fails', async () => {
      const categories = undefined;
      server.use(
        http.get(
          `${baseUrl}/search/merchandising/v1/CLOTHING_AND_HOME/attributes`,
          () => HttpResponse.error()
        )
      );
      const { result } = renderHook(() =>
        useAttributes({ categories, countryCode: 'UK', type: 'alphanumeric' })
      );
      await waitFor(() => {
        expect(result.current.fetchError).toContain('Failed to fetch');
      });
    });
  });
});
