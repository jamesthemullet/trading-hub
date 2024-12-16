import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import { Pagination } from '@/libs/api';
import type {
  CreateRowFn,
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
  mapping: RuleSetMapping<A, T, N>,
  basePath: string
): RowsApi => {
  const router = useRouter();
  const [rowsState, setRowsState] = useState<{
    pagination: Pagination;
    rows: Row[];
  }>({
    pagination: {
      totalItems: 0,
    },
    rows: [],
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const createNewRow = useCallback<CreateRowFn>(
    (newRowCreateMode?: 'create-then-redirect' | 'redirect-to-new') => {
      const asyncCall = async () => {
        const emptyRuleSet = mapping.getEmptyRuleSet();
        if (newRowCreateMode === 'create-then-redirect') {
          setIsLoading(true);
          const [error, result] = await handlePromise(
            mapping.newRuleSet(emptyRuleSet)
          );
          if (error) {
            setError(
              `Failed to create new ruleset ${JSON.stringify(handleError(error))}`
            );
            return;
          }
          mapping.ruleSetToRow(result.data, {});
          setIsLoading(false);
          const row = mapping.ruleSetToRow(result.data, {});
          router.push(`${basePath}/edit/${row.id}`);
          return;
        }
        router.push(`${basePath}/new`);
      };
      return asyncCall();
    },
    [mapping, router, basePath]
  );

  const getRows = useCallback<GetRowsFn>(
    (query, page, rows, countryCode) => {
      const asyncCall = async () => {
        setIsLoading(true);
        const [error, data] = await handlePromise(
          mapping.queryAllRuleSets({
            q: query,
            start: page,
            rows,
            countryCode,
          })
        );

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
        setIsLoading(false);
      };
      return asyncCall();
    },
    [mapping]
  );

  const deleteRow = useCallback<DeleteRowFn>(
    ({ id }) => {
      const asyncCall = async () => {
        const [error] = await handlePromise(mapping.deleteRuleSetById(id));
        if (error) {
          setError(
            `Error whilst deleting ruleset: ${JSON.stringify(handleError(error))}`
          );
          return;
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
        if (error) {
          setError(
            `Failed to duplicate ruleset ${JSON.stringify(handleError(error))}`
          );
          return;
        }
        const row = mapping.ruleSetToRow(result.data, {});
        router.push(`${basePath}/edit/${row.id}`);
        return;
      };
      return callAsync();
    },
    [mapping, basePath, router]
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
    createNewRow,
    getRows,
    deleteRow,
    duplicateRow,
    toggleRow,
    error,
    isLoading,
    rowsState,
  };
};
