import type { MerchandisingReturnedCategoryRuleSetHistory } from '@/libs/api';
import { search } from '@/libs/api';
import type { HistoryResult } from '@/libs/hooks/utils/use-history-pagination';
import { useHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type CategoryHistoryChange =
  MerchandisingReturnedCategoryRuleSetHistory['changes'][number];

export const useCategoryHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
): HistoryResult<CategoryHistoryChange> =>
  useHistoryPagination(id, currentPage, currentPageSize, (histId, params) =>
    search().betaMerchandisingCategoryRulesetHistoryList(histId, params)
  );
