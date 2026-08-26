import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useUpdateRuleSet } from './use-rule-set-update';

const baseUrl = 'http://localhost';
const ruleSetId = '38760268-4e84-4bf8-a12e-e151bc18c44e';
const categoryId = 'cat_123';

const rules = {
  pinnedProducts: [{ id: 'xyz0' }],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  includes: { alphanumeric: [] },
  excludes: { alphanumeric: [] },
};

const betaHandler = jest.fn();
const v1Handler = jest.fn();

const handlers = [
  http.put(
    `${baseUrl}/search/beta/merchandising/category/ruleset/${ruleSetId}`,
    async ({ request }) => {
      betaHandler(await request.json());
      return HttpResponse.json({}, { status: 200 });
    }
  ),
  http.put(
    `${baseUrl}/search/merchandising/v1/CLOTHING_AND_HOME/category/ruleset/${ruleSetId}`,
    async ({ request }) => {
      v1Handler(await request.json());
      return HttpResponse.json({}, { status: 200 });
    }
  ),
];

const server = setupServer(...handlers);

const args = { ruleSetId, isEnabled: true, rules, categoryIds: [categoryId] };

describe('useUpdateRuleSet', () => {
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

  it('updates via the beta endpoint by default', async () => {
    const { result } = renderHook(() => useUpdateRuleSet());

    let res;
    await act(async () => {
      res = await result.current.updateCategoryRuleSet(args);
    });

    expect(res).toEqual({ status: 'success' });
    expect(betaHandler).toHaveBeenCalledWith(
      expect.objectContaining({ categoryIds: [categoryId] })
    );
    expect(v1Handler).not.toHaveBeenCalled();
  });

  it('updates via the v1 endpoint with the version and dates when enabled', async () => {
    const { result } = renderHook(() => useUpdateRuleSet());

    let res;
    await act(async () => {
      res = await result.current.updateCategoryRuleSet({
        ...args,
        startDate: '2024-11-15T23:59:00.000Z',
        endDate: '2024-12-15T23:59:00.000Z',
        version: 3,
        shouldUseV1: true,
      });
    });

    expect(res).toEqual({ status: 'success' });
    expect(v1Handler).toHaveBeenCalledWith(
      expect.objectContaining({
        version: 3,
        startDate: '2024-11-15T23:59:00.000Z',
        endDate: '2024-12-15T23:59:00.000Z',
      })
    );
    expect(betaHandler).not.toHaveBeenCalled();
  });
});
