import { useMemo } from 'react';

import type {
  FormattedRow,
  GlobalAttributesPageState,
} from './global-attributes-page-reducer';

export const useCheckedRowsSelector = (
  state: GlobalAttributesPageState
): FormattedRow[] => {
  const checkedRows = useMemo(() => {
    const checkedSet = new Set([
      ...state.boostedRows.filter((row) => row.isChecked),
      ...state.excludedRows.filter((row) => row.isChecked),
      ...state.nonBoostedExcludedRows.filter((row) => row.isChecked),
    ]);
    return Array.from(checkedSet);
  }, [state.boostedRows, state.excludedRows, state.nonBoostedExcludedRows]);

  return checkedRows;
};
