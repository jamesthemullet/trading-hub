import type { MerchandisingReturnedKeywordRedirectHistory } from '@/libs/api';
import { search } from '@/libs/api';
import type { HistoryResult } from '@/libs/hooks/utils/use-history-pagination';
import { useHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type RedirectHistoryChange =
  MerchandisingReturnedKeywordRedirectHistory['changes'][number];

export const useRedirectHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
): HistoryResult<RedirectHistoryChange> =>
  useHistoryPagination(id, currentPage, currentPageSize, (histId, params) =>
    search().betaMerchandisingKeywordRedirectHistoryList(histId, params)
  );
