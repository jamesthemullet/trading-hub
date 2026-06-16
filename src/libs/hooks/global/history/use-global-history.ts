import type { MerchandisingReturnedGlobalRuleSetHistory } from '@/libs/api';
import { search } from '@/libs/api';
import type { HistoryResult } from '@/libs/hooks/utils/use-history-pagination';
import { useHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type GlobalHistoryChange =
  MerchandisingReturnedGlobalRuleSetHistory['changes'][number];

export const useGlobalHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
): HistoryResult<GlobalHistoryChange> =>
  useHistoryPagination(id, currentPage, currentPageSize, (histId, params) =>
    search().betaMerchandisingGlobalRulesetHistoryList(histId, params)
  );
