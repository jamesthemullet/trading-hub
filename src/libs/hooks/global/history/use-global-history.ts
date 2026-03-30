import { useEffect, useState } from 'react';

import type {
  MerchandisingPagination,
  MerchandisingReturnedGlobalRuleSetHistory,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

type GlobalHistoryChange =
  MerchandisingReturnedGlobalRuleSetHistory['changes'][number] & {
    id: string;
  };

type GlobalHistory = {
  changes: GlobalHistoryChange[];
  pagination: MerchandisingPagination;
};

export const useGlobalHistory = (
  id: string,
  currentPage: number,
  currentPageSize: number
) => {
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
