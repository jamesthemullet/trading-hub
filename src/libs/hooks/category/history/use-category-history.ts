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
  pagination?: MerchandisingPagination;
};

export const useCategoryHistory = (id: string) => {
  const [history, setHistory] = useState<CategoryHistory>({
    changes: [],
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
          await search().betaMerchandisingCategoryRulesetHistoryList(id);

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
  }, [id]);

  return { history, error, isLoading };
};
