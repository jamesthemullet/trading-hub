import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useUpdateRuleSet } from './use-rule-set-update';

const ruleSetId = '38760268-4e84-4bf8-a12e-e151bc18c44e';
const categoryId = 'cat_123';

const mockMerchandisingRules = {
  pinnedProducts: [{ id: 'xyz0' }],
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

const baseUrl = 'http://localhost';
const ruleSet = {
  rules: mockMerchandisingRules,
  categoryIds: [categoryId],
  isEnabled: true,
  categoryName: 'Jeans',
  id: ruleSetId,
  lastChanged: { date: '2023-12-28T14:24:17Z', user: 'M&S' },
};

const updateRuleSetMock = jest.fn();

const handlers = [
  http.put(
    `${baseUrl}/search/beta/merchandising/category/ruleset/${ruleSetId}`,
    () => {
      const { data, status } = updateRuleSetMock();
      return HttpResponse.json(data, status);
    }
  ),
];

const server = setupServer(...handlers);

describe('useUpdateRuleSet', () => {
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

  it('should update rule set', async () => {
    updateRuleSetMock.mockReturnValueOnce({
      data: ruleSet,
      status: { status: 200 },
    });
    const {
      result: { current },
    } = renderHook(() => useUpdateRuleSet());
    await act(async () => {
      const resp = await current.updateCategoryRuleSet({
        ruleSetId,
        isEnabled: true,
        rules: mockMerchandisingRules,
        categoryIds: [categoryId],
        startDate: '2024-11-15T23:59:00.000Z',
        endDate: '2024-11-15T23:59:00.000Z',
      });

      expect(resp).toEqual({ status: 'success' });
    });
  });

  it('should return error if API returns non 200', async () => {
    updateRuleSetMock.mockReturnValueOnce({
      status: { status: 500 },
      data: {
        message: 'JSON parse error',
        status: 'Bad Request',
      },
    });
    const { result } = renderHook(() => useUpdateRuleSet());

    await act(async () => {
      await result.current.updateCategoryRuleSet({
        ruleSetId,
        isEnabled: true,
        rules: mockMerchandisingRules,
        categoryIds: [categoryId],
      });
    });

    expect(result.current.error).toBe('Error JSON parse error Bad Request');
  });

  it('should error if API fails to fetch', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    server.use(
      http.put(
        `${baseUrl}/search/beta/merchandising/category/ruleset/${ruleSetId}`,
        () => HttpResponse.error()
      )
    );
    const { result } = renderHook(() => useUpdateRuleSet());

    await act(async () => {
      await result.current.updateCategoryRuleSet({
        ruleSetId,
        isEnabled: true,
        rules: mockMerchandisingRules,
        categoryIds: [categoryId],
      });
    });

    expect(result.current.error).toBe('Unknown error');
  });
});
