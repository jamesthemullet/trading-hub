import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGlobalFacetUpdate } from './use-global-facet-update';

const baseUrl = 'http://localhost';

const facet = {
  displayValue: 'color',
  indexPropertyName: 'color',
  id: 'color-id',
  lastChanged: {
    date: '2024-07-01T00:00:00.000Z',
    user: 'Test User',
  },
  merged: [],
};
const facetId = 'color-id';
const updateGlobalFacetMock = jest.fn();

const handlers = [
  http.put(`${baseUrl}/search/beta/merchandising/facet/${facetId}`, () => {
    const { data, status } = updateGlobalFacetMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useGlobalFacetUpdate', () => {
  beforeEach(() => {
    const DATE_TO_USE = new Date('2024-07-01T00:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => DATE_TO_USE) as unknown as DateConstructor;
    global.Date.UTC = _Date.UTC;
  });

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
    const {
      result: { current },
    } = renderHook(() => useGlobalFacetUpdate());

    const response = await current.handleUpdate({
      facetId: 'color-id',
      data: facet,
    });

    expect(response).toEqual(facet);
  });

  //   it('should render the hook with error', async () => {
  //     server.use(
  //       http.put(`${baseUrl}/search/beta/merchandising/facet/${facetId}`, () => {
  //         return HttpResponse.json(
  //           { message: 'Internal Server Error' },
  //           { status: 500 }
  //         );
  //       })
  //     );

  //     const { result } = renderHook(() => useGlobalFacetUpdate());

  //     await waitFor(() => {
  //       expect(result.current.error).toEqual('Internal Server Error');
  //     });
  //   });
});
