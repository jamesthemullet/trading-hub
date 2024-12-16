import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { ReturnedCategoryRuleSet, ReturnedCategoryRuleSets } from '@/libs/api';

import { useRuleSetRowsState } from './use-rule-set-rows-state';

const ruleSetId = '38760268-4e84-4bf8-a12e-e151bc18c44e';
const categoryId = 'cat_123';

const mockRuleSet: ReturnedCategoryRuleSet = {
  id: ruleSetId,
  isEnabled: true,
  lastChanged: {
    date: '2023-12-28T14:24:17Z',
    user: 'M&S',
  },
  categoriesInfo: [
    {
      id: categoryId,
      plpUrl: '/jeans',
    },
  ],
  rules: {
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
  },
};

const mockResponse: ReturnedCategoryRuleSets = {
  ruleSets: [mockRuleSet],
  pagination: {
    totalItems: 10,
  },
};

const mappingMock = {
  getEmptyRuleSet: jest.fn(),
  queryAllRuleSets: jest.fn(),
  deleteRuleSetById: jest.fn(),
  queryRuleSetById: jest.fn(),
  updateRuleSetById: jest.fn(),
  newRuleSet: jest.fn(),
  ruleSetToRow: (ruleSet: any) => ruleSet,
  toggleRuleSet: (ruleSet: any) => ({
    ...ruleSet,
    isEnabled: !ruleSet.isEnabled,
  }),
  allToTotalItems: (data: any) => data.pagination.totalItems,
  allToArray: (data: any) => data.ruleSets,
  returnedToRuleSet: (data: any) => data,
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('useCategoryRuleSetApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push: jest.fn(),
    });
  });

  describe('createNewRow', () => {
    it('should create a new rule set', async () => {
      mappingMock.newRuleSet.mockResolvedValue({
        data: mockRuleSet,
        status: { status: 200 },
      });

      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.createNewRow('create-then-redirect');
      });

      expect(mappingMock.newRuleSet).toHaveBeenCalled();
      expect(useRouter().push).toHaveBeenCalledWith(
        `/search/rulesets/edit/${ruleSetId}`
      );
    });

    it('should return errors', async () => {
      mappingMock.newRuleSet.mockRejectedValue({
        error: {
          message: 'something went wrong',
          status: 500,
        },
      });

      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.createNewRow('create-then-redirect');
      });

      expect(result.current.error).toEqual(
        'Failed to create new ruleset "Error something went wrong 500"'
      );
    });
  });

  describe('getRows', () => {
    it('should return a function that fetches the category rule sets', async () => {
      mappingMock.queryAllRuleSets.mockResolvedValue({
        data: mockResponse,
        status: { status: 200 },
      });

      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.getRows('', 1, 10, 'UK');
      });

      await waitFor(() => {
        expect(result.current.rowsState).toEqual({
          pagination: { totalItems: 10 },
          rows: [mockRuleSet],
        });
      });
    });

    it('should return errors', async () => {
      mappingMock.queryAllRuleSets.mockRejectedValue({
        error: {
          message: 'something went wrong',
          status: 500,
        },
      });

      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.getRows('', 1, 10, 'UK');
      });

      expect(result.current.error).toEqual(
        'Error whilst retrieving ruleset: "Error something went wrong 500"'
      );
    });
  });

  describe('deleteRow', () => {
    it('should delete a ruleset', async () => {
      mappingMock.deleteRuleSetById.mockResolvedValue({
        data: 'ok',
        status: { status: 200 },
      });
      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.deleteRow({ id: ruleSetId });
      });

      expect(
        result.current.rowsState.rows.find((row) => row.id === ruleSetId)
      ).toBeUndefined();
    });

    it('should delete a ruleset with no pagination', async () => {
      mappingMock.queryAllRuleSets.mockResolvedValue({
        data: { ...mockResponse, pagination: {} },
        status: { status: 200 },
      });
      mappingMock.deleteRuleSetById.mockResolvedValue({
        data: 'ok',
        status: { status: 200 },
      });
      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.getRows('', 1, 10, 'UK');
      });

      await act(async () => {
        await result.current.deleteRow({ id: ruleSetId });
      });

      expect(
        result.current.rowsState.rows.find((row) => row.id === ruleSetId)
      ).toBeUndefined();
    });

    it('should return errors', async () => {
      mappingMock.deleteRuleSetById.mockRejectedValue({
        error: { message: 'not ok', status: 200 },
      });
      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.deleteRow({ id: ruleSetId });
      });

      expect(result.current.error).toEqual(
        'Error whilst deleting ruleset: "Error not ok 200"'
      );
    });
  });

  describe('duplicateRow', () => {
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
      categoryIds: [categoryId],
      isEnabled: false,
      categoryName: 'Jeans',
      id: ruleSetId,
      lastChanged: { date: '2023-12-28T14:24:17Z', user: 'M&S' },
    };

    it('should update rule set', async () => {
      mappingMock.queryRuleSetById.mockResolvedValue({
        data: mockRuleSet,
        status: { status: 200 },
      });
      mappingMock.newRuleSet.mockResolvedValue({
        data: ruleSet,
        status: { status: 200 },
      });
      const {
        result: { current },
      } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await current.duplicateRow(ruleSetId);
      });

      expect(useRouter().push).toHaveBeenCalledWith(
        `/search/rulesets/edit/${ruleSetId}`
      );
    });

    it('should return error if API returns non 200', async () => {
      mappingMock.queryRuleSetById.mockResolvedValue({
        data: mockRuleSet,
        status: { status: 200 },
      });
      mappingMock.newRuleSet.mockRejectedValue({
        error: { message: 'JSON parse error', status: 500 },
      });
      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.duplicateRow(ruleSetId);
      });

      expect(result.current.error).toStrictEqual(
        'Failed to duplicate ruleset "Error JSON parse error 500"'
      );
    });

    it('should error if GET call fails', async () => {
      mappingMock.queryRuleSetById.mockRejectedValue({
        error: { message: 'not ok', status: 500 },
      });

      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.duplicateRow(ruleSetId);
      });

      expect(result.current.error).toStrictEqual(
        'Failed to get ruleSet 38760268-4e84-4bf8-a12e-e151bc18c44e to duplicate, "Error not ok 500"'
      );
    });

    it('should error if API fails to fetch', async () => {
      mappingMock.queryRuleSetById.mockResolvedValue({
        data: mockRuleSet,
        status: { status: 200 },
      });
      mappingMock.newRuleSet.mockImplementation(async () => {
        throw new Error('No data');
      });
      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.duplicateRow(ruleSetId);
      });

      expect(result.current.error).toStrictEqual(
        'Failed to duplicate ruleset "Unknown error"'
      );
    });
  });

  describe('toggleRow', () => {
    it('should update rule set by toggling isEnabled', async () => {
      mappingMock.queryAllRuleSets.mockResolvedValue({
        data: mockResponse,
        status: { status: 200 },
      });
      mappingMock.queryRuleSetById.mockResolvedValue({
        data: mockRuleSet,
        status: { status: 200 },
      });
      mappingMock.updateRuleSetById.mockResolvedValue({
        data: { ...mockRuleSet, isEnabled: false },
        status: { status: 200 },
      });
      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.getRows('', 1, 10, 'UK');
      });

      expect(
        result.current.rowsState.rows.find((row) => row.id === ruleSetId)
          ?.isEnabled
      ).toEqual(true);

      await act(async () => {
        await result.current.toggleRow({ id: ruleSetId });
      });

      expect(
        result.current.rowsState.rows.find((row) => row.id === ruleSetId)
          ?.isEnabled
      ).toEqual(false);
    });

    it('should return error if API returns non 200', async () => {
      mappingMock.queryRuleSetById.mockResolvedValue({
        data: mockRuleSet,
        status: { status: 200 },
      });
      mappingMock.updateRuleSetById.mockRejectedValue({
        error: {
          message: 'JSON parse error',
          status: '500',
        },
      });
      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.toggleRow({ id: ruleSetId });
      });

      expect(result.current.error).toStrictEqual(
        'Error whilst updating ruleset: "Error JSON parse error 500"'
      );
    });

    it('should error if GET call fails', async () => {
      mappingMock.queryRuleSetById.mockRejectedValue({
        error: { message: 'not ok', status: 500 },
      });

      const { result } = renderHook(() =>
        useRuleSetRowsState(mappingMock, '/search/rulesets')
      );

      await act(async () => {
        await result.current.toggleRow({ id: ruleSetId });
      });

      expect(result.current.error).toStrictEqual(
        'Error whilst getting ruleSet 38760268-4e84-4bf8-a12e-e151bc18c44e to toggle: "Error not ok 500"'
      );
    });
  });
});
