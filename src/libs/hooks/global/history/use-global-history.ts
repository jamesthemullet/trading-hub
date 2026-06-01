import { useEffect, useState } from 'react';

import type {
  MerchandisingPagination,
  MerchandisingReturnedGlobalRuleSetHistory,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

// TODO: The API returns `id` on each history entry but the OpenAPI schema does not document it.
type GlobalHistory = {
  changes: Array<
    MerchandisingReturnedGlobalRuleSetHistory['changes'][number] & {
      id: string;
    }
  >;
  pagination: MerchandisingPagination;
};

export const useGlobalHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
): {
  history: GlobalHistory;
  error: string;
  isLoading: boolean;
} => {
  const [history, setHistory] = useState<GlobalHistory>({
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
          await search().betaMerchandisingGlobalRulesetHistoryList(id, {
            start: (currentPage - 1) * currentPageSize,
            rows: currentPageSize,
          });

        setHistory(response.data as GlobalHistory);
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
