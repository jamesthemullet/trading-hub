import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGlobalFacetUpdate } from './use-global-facet-update';

const baseUrl = 'http://localhost';
const facetId = 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84';
const data = { displayValue: 'colour', indexPropertyName: 'color' };

const v1Handler = jest.fn();

const handlers = [
  http.put(
    `${baseUrl}/search/merchandising/v1/CLOTHING_AND_HOME/facet/${facetId}`,
    async ({ request }) => {
      v1Handler(await request.json());
      return HttpResponse.json({}, { status: 200 });
    }
  ),
];

const server = setupServer(...handlers);

describe('useGlobalFacetUpdate', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('updates via the v1 endpoint with the version', async () => {
    const { result } = renderHook(() => useGlobalFacetUpdate());

    let res;
    await act(async () => {
      res = await result.current.handleGlobalFacetUpdate({
        facetId,
        data,
        version: 2,
      });
    });

    expect(res).toEqual({ status: 'success' });
    expect(v1Handler).toHaveBeenCalledWith(
      expect.objectContaining({ version: 2, indexPropertyName: 'color' })
    );
  });
});
