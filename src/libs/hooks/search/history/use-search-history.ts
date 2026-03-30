import { useEffect, useState } from 'react';

import type {
  MerchandisingPagination,
  MerchandisingReturnedKeywordRuleSetHistory,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

type SearchHistoryChange =
  MerchandisingReturnedKeywordRuleSetHistory['changes'][number] & {
    id: string;
  };

type SearchHistory = {
  changes: SearchHistoryChange[];
  pagination: MerchandisingPagination;
};

export const useSearchHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
) => {
  const [history, setHistory] = useState<SearchHistory>({
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
          await search().betaMerchandisingKeywordRulesetHistoryList(id, {
            start: (currentPage - 1) * currentPageSize,
            rows: currentPageSize,
          });

        setHistory(response.data as SearchHistory);
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
