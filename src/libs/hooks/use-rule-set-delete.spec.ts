import { act, renderHook } from '@testing-library/react';

import { useRuleSetDelete } from './use-rule-set-delete';

const getRuleSetDeleteMock = jest.fn();

const mockRuleSetId = '3ffe0fc6-bef9-40a3-a5f8-a2e6331dbed3';

describe('useRuleSetDelete', () => {
  beforeAll(() => {
    global.fetch = () => Promise.resolve(getRuleSetDeleteMock());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should delete a ruleset', async () => {
    getRuleSetDeleteMock.mockReturnValueOnce({
      json: () => Promise.resolve([]),
      status: 200,
      ok: true,
    });
    const { result } = renderHook(() => useRuleSetDelete());

    await act(async () => {
      await result.current.handleDelete({ rulesetId: mockRuleSetId });
    });

    expect(result.current.error).toEqual('');
  });

  it('should return errors', async () => {
    getRuleSetDeleteMock.mockReturnValueOnce({
      json: () => Promise.resolve([]),
      status: 500,
    });
    const { result } = renderHook(() => useRuleSetDelete());

    await act(async () => {
      await result.current.handleDelete({ rulesetId: mockRuleSetId });
    });

    expect(result.current.error).toEqual(
      'Failed to delete ruleset {"status":500,"data":null,"error":[]}'
    );
  });
});
