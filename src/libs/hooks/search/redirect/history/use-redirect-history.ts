import type { MerchandisingReturnedKeywordRedirectHistory } from '@/libs/api';
import { search } from '@/libs/api';
import { createUseHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type RedirectHistoryChange =
  MerchandisingReturnedKeywordRedirectHistory['changes'][number];

export const useRedirectHistory =
  createUseHistoryPagination<RedirectHistoryChange>((id, params) =>
    search().getKeywordRedirectHistory(id, params)
  );
