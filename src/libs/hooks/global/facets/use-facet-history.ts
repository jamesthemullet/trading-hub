import type { MerchandisingReturnedGlobalFacetHistory } from '@/libs/api';
import { search } from '@/libs/api';
import { createUseHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type FacetHistoryChange =
  MerchandisingReturnedGlobalFacetHistory['changes'][number];

export const useFacetHistory = createUseHistoryPagination<FacetHistoryChange>(
  (histId, params) => search().getGlobalFacetHistory(histId, params)
);
