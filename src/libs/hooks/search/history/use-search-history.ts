import { useEffect, useState } from 'react';

import type { MerchandisingReturnedKeywordRuleSetHistory } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

type SearchHistoryChange =
  MerchandisingReturnedKeywordRuleSetHistory['changes'][number] & {
    id: string;
    entityId: string;
    savedAt: string;
    savedBy: string;
    schemaVersion: string;
  };

type SearchHistory = {
  changes: SearchHistoryChange[];
};

export const useSearchHistory = (id: string) => {
  const [history, setHistory] = useState<SearchHistory>({
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
          await search().betaMerchandisingKeywordRulesetHistoryList(id);

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
  }, [id]);

  return { history, error, isLoading };
};
