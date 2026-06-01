import { useEffect, useState } from 'react';

import type {
  MerchandisingPagination,
  MerchandisingReturnedKeywordRedirectHistory,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

// TODO: The API returns `id` on each history entry but the OpenAPI schema does not document it.
type RedirectHistoryChange =
  MerchandisingReturnedKeywordRedirectHistory['changes'][number] & {
    id: string;
  };

type RedirectHistory = {
  changes: RedirectHistoryChange[];
  pagination: MerchandisingPagination;
};

export const useRedirectHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
): {
  history: RedirectHistory;
  error: string;
  isLoading: boolean;
} => {
  const [history, setHistory] = useState<RedirectHistory>({
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
          await search().betaMerchandisingKeywordRedirectHistoryList(id, {
            start: (currentPage - 1) * currentPageSize,
            rows: currentPageSize,
          });

        setHistory(response.data as RedirectHistory);
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
