import type { MerchandisingReturnedKeywordRuleSetHistory } from '@/libs/api';
import { search } from '@/libs/api';
import type { HistoryResult } from '@/libs/hooks/utils/use-history-pagination';
import { useHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type SearchHistoryChange =
  MerchandisingReturnedKeywordRuleSetHistory['changes'][number];

export const useSearchHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
): HistoryResult<SearchHistoryChange> =>
  useHistoryPagination(id, currentPage, currentPageSize, (histId, params) =>
    search().betaMerchandisingKeywordRulesetHistoryList(histId, params)
  );
