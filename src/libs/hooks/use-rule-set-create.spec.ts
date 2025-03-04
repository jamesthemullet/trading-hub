import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useRuleSetCreate } from './use-rule-set-create';

const getRuleSetCreateMock = jest.fn();

const baseUrl = 'http://localhost';
const handlers = [
  http.post(`${baseUrl}/search/beta/merchandising/category/ruleset`, () => {
    const { data, status } = getRuleSetCreateMock();
    return HttpResponse.json(data, status);
  }),
];

const mockMerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};

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
    const resp = await current.createRuleset({
      categoryIds: [mockCategoryId],
      countryCode: 'UK',
      rules: mockMerchandisingRules,
      facets: [],
      isEnabled: true,
    });

    expect(resp).toEqual(mockResponse);
  });

  it('should return errors', async () => {
    getRuleSetCreateMock.mockReturnValueOnce({
      data: {
        message: 'Validation Issues: You can only pin up to 100 products',
        status: 'Bad Request',
      },
      status: { status: 500 },
    });
    const { result } = renderHook(() => useRuleSetCreate());

    await act(async () => {
      await result.current.createRuleset({
        rules: mockMerchandisingRules,
        countryCode: 'UK',
        categoryIds: ['foo'],
        facets: [],
        isEnabled: false,
      });
    });

    expect(result.current.error).toBe(
      'Error Validation Issues: You can only pin up to 100 products Bad Request'
    );
  });
});
