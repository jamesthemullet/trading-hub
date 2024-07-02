import { useEffect, useState } from 'react';

import type { Pagination, ReturnedKeywordRuleSet } from '@/libs/api';
import { search } from '@/libs/api';

export const useSearchRulesetList = (
  searchQuery: string,
  start: number,
  rows: number
) => {
  const [shouldRefetch, refetch] = useState({});
  const [ruleSets, setRuleSets] = useState<Array<ReturnedKeywordRuleSet>>([]);
  const [pagination, setPagination] = useState<Pagination>({ totalItems: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const asyncCall = async () => {
      const apiCall = search().betaMerchandisingKeywordRulesetList;

      try {
        const result = await apiCall({
          q: searchQuery,
          start,
          rows,
        });

        setRuleSets(result.data.ruleSets);
        setPagination(result.data.pagination);
      } catch (error: unknown) {
        setError('Internal Server Error');
      }
    };

    void asyncCall();
  }, [start, rows, searchQuery, shouldRefetch]);

  return {
    error,
    pagination,
    refetchRuleSetList: () => refetch({}),
    ruleSets,
    setRuleSets,
  };
};
