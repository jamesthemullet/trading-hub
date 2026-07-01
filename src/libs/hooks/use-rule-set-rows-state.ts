import { useCallback, useState } from 'react';

import type { MerchandisingPagination } from '@/libs/api';
import type {
  DeleteRowFn,
  DuplicateRowFn,
  GetRowsFn,
  Row,
  RowsApi,
  RuleSetMapping,
  ToggleRowFn,
} from '@/libs/components/types';
import { handlePromise } from '@/libs/utils/handle-promise';

import { handleError } from './utils/error';

const toggle = <T extends { isEnabled: boolean }>(
  value: T,
  mode: 'toggle' | 'set-to-false' = 'toggle'
) => ({
  ...value,
  isEnabled: mode === 'toggle' ? !value.isEnabled : false,
});

const getPaginationTotalItems = <
  T extends { pagination: { totalItems?: number } },
>(
  data: T
) => data.pagination.totalItems;

export const useRuleSetRowsState = <
  A extends { pagination: { totalItems?: number } },
  T,
  N extends { isEnabled: boolean },
>(
  mapping: RuleSetMapping<A, T, N>
): RowsApi => {
  const [rowsState, setRowsState] = useState<{
    pagination: MerchandisingPagination;
    rows: Row[];
  }>({
    pagination: {
      totalItems: 0,
    },
    rows: [],
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const getRows = useCallback<GetRowsFn>(
    (currentPage, currentPageSize, query, countryCode, havingRules) => {
      const asyncCall = async () => {
        setIsLoading(true);
        try {
          const [error, data] = await handlePromise(
            mapping.queryAllRuleSets({
              q: query,
              start: (currentPage - 1) * currentPageSize,
              rows: currentPageSize,
              countryCode,
              ...(havingRules !== undefined ? { havingRules } : {}),
            })
          );

          // istanbul ignore else
          if (error) {
            setError(
              `Error whilst retrieving ruleset: ${JSON.stringify(handleError(error))}`
            );
            return;
          }

          setRowsState({
            pagination: {
              totalItems: getPaginationTotalItems(data.data),
            },
            rows: mapping
              .allToArray(data.data)
              .map((ruleSet) =>
                mapping.ruleSetToRow(ruleSet, { searchQuery: query })
              ),
          });
        } finally {
          setIsLoading(false);
        }
      };
      return asyncCall();
    },
    [mapping]
  );

  const deleteRow = useCallback<DeleteRowFn>(
    ({ id }) => {
      const asyncCall = async () => {
        const [error] = await handlePromise(mapping.deleteRuleSetById(id));
        // istanbul ignore else
        if (error) {
          setError(
            `Error whilst deleting ruleset: ${JSON.stringify(handleError(error))}`
          );
          return false;
        }

        setRowsState((rowsState) => {
          const updatedRows = rowsState.rows.filter((row) => row.id !== id);
          return {
            ...rowsState,
            rows: updatedRows,
            pagination: {
              totalItems: (rowsState.pagination.totalItems ?? 0) - 1,
            },
          };
        });

        return true;
      };
      return asyncCall();
    },
    [mapping]
  );

  const duplicateRow = useCallback<DuplicateRowFn>(
    (id: string) => {
      const callAsync = async () => {
        const [ruleSetToCopyError, ruleSetToCopy] = await handlePromise(
          mapping.queryRuleSetById(id)
        );

        if (ruleSetToCopyError) {
          setError(
            `Failed to get ruleSet ${id} to duplicate, ${JSON.stringify(handleError(ruleSetToCopyError))}`
          );
          return;
        }

        const ruleSet = mapping.returnedToRuleSet(ruleSetToCopy.data);
        const ruleSetWithIsEnabledSetToFalse = toggle(ruleSet, 'set-to-false');
        const [error, result] = await handlePromise(
          mapping.newRuleSet(ruleSetWithIsEnabledSetToFalse)
        );
        // istanbul ignore else
        if (error) {
          setError(
            `Failed to duplicate ruleset ${JSON.stringify(handleError(error))}`
          );
          return;
        }

        const row = mapping.ruleSetToRow(result.data, {});
        setRowsState((rowsState) => {
          return {
            ...rowsState,
            rows: [row, ...rowsState.rows],
            pagination: {
              totalItems: (rowsState.pagination.totalItems ?? 0) + 1,
            },
          };
        });
        return;
      };
      return callAsync();
    },
    [mapping]
  );

  const toggleRow = useCallback<ToggleRowFn>(
    ({ id }) => {
      const callAsync = async () => {
        const [ruleSetToCopyError, ruleSetToToggle] = await handlePromise(
          mapping.queryRuleSetById(id)
        );

        if (ruleSetToCopyError) {
          setError(
            `Error whilst getting ruleSet ${id} to toggle: ${JSON.stringify(handleError(ruleSetToCopyError))}`
          );
          return;
        }

        const ruleSet = mapping.returnedToRuleSet(ruleSetToToggle.data);
        const toggledRuleSet = toggle(ruleSet);

        const [error, updatedRow] = await handlePromise(
          mapping.updateRuleSetById(id, toggledRuleSet)
        );
        // istanbul ignore else
        if (error) {
          setError(
            `Error whilst updating ruleset: ${JSON.stringify(handleError(error))}`
          );
          return;
        }

        setRowsState((rowsState) => {
          const updatedRows = rowsState.rows.map((row) =>
            row.id === id ? mapping.ruleSetToRow(updatedRow.data, {}) : row
          );
          return {
            ...rowsState,
            rows: updatedRows,
          };
        });
      };
      return callAsync();
    },
    [mapping]
  );

  return {
    getRows,
    deleteRow,
    duplicateRow,
    toggleRow,
    error,
    isLoading,
    rowsState,
  };
};
