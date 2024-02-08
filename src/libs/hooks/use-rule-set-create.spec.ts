import { act, renderHook } from '@testing-library/react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useRuleSetCreate } from './use-rule-set-create';

const getRuleSetCreateMock = jest.fn();

const baseUrl = 'http://localhost';
const handlers = [
  http.post(`${baseUrl}/merchandising/ruleset`, () => {
    const { data, status, error } = getRuleSetCreateMock();
    if (error) {
      return HttpResponse.error();
    }
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);
const mockCategoryId = 'catid123';

describe('useRuleSetCreate', () => {
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

  it('should create a new ruleset', async () => {
    const mockResponse = { id: 'foo' };
    getRuleSetCreateMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });
    const {
      result: { current },
    } = renderHook(() => useRuleSetCreate());
    const resp = await current.handlePost({ categoryId: mockCategoryId });

    expect(resp).toEqual(mockResponse);
  });

  it('should return errors', async () => {
    getRuleSetCreateMock.mockReturnValueOnce({
      data: {},
      error: 'error',
      status: { status: 500 },
    });
    const { result } = renderHook(() => useRuleSetCreate());

    await act(async () => {
      await result.current.handlePost({ categoryId: mockCategoryId });
    });

    expect(result.current.error).toBe(
      'Failed to create ruleset TypeError: Failed to fetch'
    );
  });
});
