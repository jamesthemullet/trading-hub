import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGlobalRuleSetUpdate } from './use-global-rule-set-update';

const ruleSetId = '38760268-4e84-4bf8-a12e-e151bc18c44e';
const baseUrl = 'http://localhost';
const deleteRuleSetMock = jest.fn();
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

const ruleSet = {
  rules: mockMerchandisingRules,
  categoryId: categoryId,
  isEnabled: true,
  categoryName: 'Jeans',
  id: ruleSetId,
  lastChanged: { date: '2023-12-28T14:24:17Z', user: 'M&S' },
  excludedFacets: {
    facets: [],
  },
};

const ruleSetUrl = `${baseUrl}/search/beta/merchandising/global/ruleset/${ruleSetId}`;
const handlers = [
  http.put(ruleSetUrl, () => {
    const { data, status } = deleteRuleSetMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useGlobalRuleSetDelete', () => {
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

  it('should update a ruleset', async () => {
    deleteRuleSetMock.mockReturnValueOnce({
      data: 'ok',
      status: { status: 200 },
    });
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    await act(async () => {
      await result.current.saveGlobalRuleset({ ruleSetId, ruleSet });
    });

    expect(result.current.error).toEqual('');
  });

  it('should return errors', async () => {
    deleteRuleSetMock.mockReturnValueOnce({
      data: 'not ok',
      status: { status: 500 },
    });
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    await act(async () => {
      await result.current.saveGlobalRuleset({ ruleSetId, ruleSet });
    });

    expect(result.current.error).toEqual('Error undefined undefined');
  });
});
