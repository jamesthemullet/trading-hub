import { useEffect, useState } from 'react';

import type { Pagination, ReturnedRuleSet } from '@/libs/api';
import { merchandising } from '@/libs/api';

export const useRuleSet = (
  searchQuery: string,
  start: number,
  rows: number
) => {
  const [shouldRefetch, refetch] = useState({});
  const [ruleSets, setRuleSets] = useState<Array<ReturnedRuleSet>>([]);
  const [pagination, setPagination] = useState<Pagination>({ totalItems: 0 });

  useEffect(() => {
    const asyncCall = async () => {
      const result = await merchandising().rulesetList({
        q: searchQuery,
        start,
        rows,
      });
      setRuleSets(result.data.ruleSets);
      setPagination(result.data.pagination);
    };

    void asyncCall();
  }, [start, rows, searchQuery, shouldRefetch]);

  return {
    ruleSets: ruleSets,
    pagination: pagination,
    refetchRuleSetList: () => refetch({}),
    setRuleSets,
  };
};
