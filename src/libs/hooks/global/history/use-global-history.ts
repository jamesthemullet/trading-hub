import type { MerchandisingReturnedGlobalRuleSetHistory } from '@/libs/api';
import { search } from '@/libs/api';
import { createUseHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type GlobalHistoryChange =
  MerchandisingReturnedGlobalRuleSetHistory['changes'][number];

export const useGlobalHistory = createUseHistoryPagination<GlobalHistoryChange>(
  (id, params) => search().getGlobalRuleSetHistory(id, params)
);
