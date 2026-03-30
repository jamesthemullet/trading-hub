import { useEffect, useState } from 'react';

import type {
  MerchandisingPagination,
  MerchandisingReturnedCategoryRuleSetHistory,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

type CategoryHistoryChange =
  MerchandisingReturnedCategoryRuleSetHistory['changes'][number] & {
    id: string;
  };

type CategoryHistory = {
  changes: CategoryHistoryChange[];
  pagination: MerchandisingPagination;
};

export const useCategoryHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
) => {
  const [history, setHistory] = useState<CategoryHistory>({
    changes: [],
    pagination: { totalItems: 0 },
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const asyncCall = async () => {
      try {
        const response =
          await search().betaMerchandisingCategoryRulesetHistoryList(id, {
            start: (currentPage - 1) * currentPageSize,
            rows: currentPageSize,
          });

        setHistory(response.data as CategoryHistory);
      } catch (error) {
        setError(handleError(error));
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, currentPage, currentPageSize]);

  return { history, error, isLoading };
};
