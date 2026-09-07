import type { MerchandisingReturnedKeywordRuleSetHistory } from '@/libs/api';
import { search } from '@/libs/api';
import { createUseHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type SearchHistoryChange =
  MerchandisingReturnedKeywordRuleSetHistory['changes'][number];

export const useSearchHistory = createUseHistoryPagination<SearchHistoryChange>(
  (id, params) => search().getKeywordRuleSetHistory(id, params)
);
