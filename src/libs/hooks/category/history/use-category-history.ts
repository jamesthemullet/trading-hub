import type { MerchandisingReturnedCategoryRuleSetHistory } from '@/libs/api';
import { search } from '@/libs/api';
import { createUseHistoryPagination } from '@/libs/hooks/utils/use-history-pagination';

type CategoryHistoryChange =
  MerchandisingReturnedCategoryRuleSetHistory['changes'][number];

export const useCategoryHistory =
  createUseHistoryPagination<CategoryHistoryChange>((id, params) =>
    search().betaMerchandisingCategoryRulesetHistoryList(id, params)
  );
