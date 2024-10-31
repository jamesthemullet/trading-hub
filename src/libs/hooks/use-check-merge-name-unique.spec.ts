import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { attributeValuesMock } from '@/pages/api/search/mocks';

import { useCheckMergeNameUnique } from './use-check-merge-name-unique';

const baseUrl = 'http://localhost';

const handlers = [
  http.get(
    `${baseUrl}/search/beta/merchandising/facet/color-id/attributeValues`,
    () => {
      return HttpResponse.json(
        {
          values: attributeValuesMock,
          pagination: {
            totalItems: 5,
          },
        },
        { status: 200 }
      );
    }
  ),
];

const server = setupServer(...handlers);

describe('useGetFacetAttributeValues', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should render the hook', async () => {
    const { result } = renderHook(() => useCheckMergeNameUnique());

    act(() => {
      result.current.checkMergeNameUnique('color-id', 'A unique name');
    });

    await waitFor(() => {
      expect(typeof result.current.checkMergeNameUnique).toBe('function');
    });

    expect(result.current.error).toBe('');
  });

  it('should return error', async () => {
    server.use(
      http.get(
        `${baseUrl}/search/beta/merchandising/facet/color-id/attributeValues`,
        () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        }
      )
    );

    const { result } = renderHook(() => useCheckMergeNameUnique());

    act(() => {
      result.current.checkMergeNameUnique('color-id', 'test');
    });

    // Wait for the hook to update
    await waitFor(() =>
      expect(result.current.error).toEqual(
        'Failed to get Facet Attribute Values'
      )
    );
  });
});
