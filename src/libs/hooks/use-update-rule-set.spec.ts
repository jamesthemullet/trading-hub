import { act, renderHook } from '@testing-library/react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useUpdateRuleSet } from './use-update-rule-set';

const ruleSetId = '38760268-4e84-4bf8-a12e-e151bc18c44e';
const categoryId = 'cat_123';
const pinnedProducts = [{ id: 'xyz0' }];
const baseUrl = 'http://localhost';
const ruleSet = {
  rules: {
    pinnedProducts: pinnedProducts,
    boosts: [],
  },
  categoryId: categoryId,
  isEnabled: true,
  categoryName: 'Jeans',
  id: ruleSetId,
  lastChanged: { date: '2023-12-28T14:24:17Z', user: 'M&S' },
};

const updateRuleSetMock = jest.fn();

const handlers = [
  http.put(`${baseUrl}/merchandising/ruleset/${ruleSetId}`, () => {
    const { data, status } = updateRuleSetMock();
    return HttpResponse.json(data, status);
  }),
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
    const resp = await current.updateRuleSet({
      id: ruleSetId,
      pinnedProducts: pinnedProducts,
      categoryId: categoryId,
    });

    expect(resp).toEqual(ruleSet);
  });

  it('should return error if API returns non 200', async () => {
    updateRuleSetMock.mockReturnValueOnce({
      data: {},
      error: 'api error',
      status: { status: 500 },
    });
    const { result } = renderHook(() => useUpdateRuleSet());

    await act(async () => {
      await result.current.updateRuleSet({
        id: ruleSetId,
        pinnedProducts: pinnedProducts,
        categoryId: categoryId,
      });
    });

    expect(result.current.error).toBe('PUT status 500');
  });

  it('should error if API fails to fetch', async () => {
    updateRuleSetMock.mockImplementation(() => {
      throw new Error('No data');
    });
    const { result } = renderHook(() => useUpdateRuleSet());

    await act(async () => {
      await result.current.updateRuleSet({
        id: ruleSetId,
        pinnedProducts: pinnedProducts,
        categoryId: categoryId,
      });
    });

    expect(result.current.error).toEqual(
      'Failed to update rule set TypeError: Failed to fetch'
    );
  });
});
