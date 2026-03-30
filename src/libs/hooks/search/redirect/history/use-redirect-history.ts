import { useEffect, useState } from 'react';

import type {
  MerchandisingPagination,
  MerchandisingReturnedKeywordRedirectHistory,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

type RedirectHistoryChange =
  MerchandisingReturnedKeywordRedirectHistory['changes'][number] & {
    id: string;
  };

type RedirectHistory = {
  changes: RedirectHistoryChange[];
  pagination?: MerchandisingPagination;
};

export const useRedirectHistory = (id: string) => {
  const [history, setHistory] = useState<RedirectHistory>({
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
          await search().betaMerchandisingKeywordRedirectHistoryList(id);

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
  }, [id]);

  return { history, error, isLoading };
};
