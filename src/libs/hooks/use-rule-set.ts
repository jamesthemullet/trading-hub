import { useEffect, useState } from 'react';
import { merchandising, type RuleSets } from '../api';

export const useRuleSet = (
  searchQuery: string,
  start: number,
  rows: number
) => {
  const [shouldRefetch, refetch] = useState({});
  const [ruleSets, setRuleSets] = useState<RuleSets>({
    ruleSets: [],
    pagination: {
      totalItems: 0,
    },
  });

  useEffect(() => {
    const asyncCall = async () => {
      const result = await merchandising().rulesetList({
        q: searchQuery,
        start,
        rows,
      });
      setRuleSets(result.data);
    };

    void asyncCall();
  }, [start, rows, searchQuery, shouldRefetch]);

  return {
    ruleSets: ruleSets.ruleSets,
    pagination: ruleSets.pagination,
    refetchRuleSetList: () => refetch({}),
  };
};
