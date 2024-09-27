import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGlobalFacetUpdate } from './use-global-facet-update';

const baseUrl = 'http://localhost';

const facetId = 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84';
const facet = {
  displayValue: 'color',
  indexPropertyName: 'color',
  id: facetId,
  lastChanged: {
    date: '2024-07-01T00:00:00.000Z',
    user: 'Test User',
  },
  merged: [],
};
const updateGlobalFacetMock = jest.fn();

const handlers = [
  http.put(`${baseUrl}/search/beta/merchandising/facet/${facetId}`, () => {
    const { data, status } = updateGlobalFacetMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useGlobalFacetUpdate', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should update global facet', async () => {
    updateGlobalFacetMock.mockReturnValueOnce({
      data: facet,
      status: { status: 200 },
    });
    const { result } = renderHook(() => useGlobalFacetUpdate());

    await act(async () => {
      await result.current.handleGlobalFacetUpdate({
        facetId: facetId,
        data: {
          displayValue: 'colour',
          indexPropertyName: 'color',
        },
      });
    });

    expect(result.current.error).toEqual('');
  });

  it('should render the hook with error', async () => {
    updateGlobalFacetMock.mockReturnValueOnce({
      data: null,
      status: { status: 500 },
    });

    const { result } = renderHook(() => useGlobalFacetUpdate());

    await act(async () => {
      await result.current.handleGlobalFacetUpdate({
        facetId: facetId,
        data: facet,
      });
    });

    await waitFor(() => {
      expect(result.current.error).toEqual('Error undefined undefined');
    });
  });
});
