import { useEffect, useState } from 'react';

import type {
  Pagination,
  ReturnedCategoryRuleSet,
  ReturnedGlobalRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';

export const useRuleSet = (
  searchQuery: string,
  start: number,
  rows: number,
  ruleSetType: 'category' | 'global'
) => {
  const [shouldRefetch, refetch] = useState({});
  const [categoryRuleSets, setCategoryRuleSets] = useState<
    Array<ReturnedCategoryRuleSet>
  >([]);
  const [globalRuleSets, setGlobalRuleSets] = useState<
    Array<ReturnedGlobalRuleSet>
  >([]);
  const [pagination, setPagination] = useState<Pagination>({ totalItems: 0 });

  useEffect(() => {
    const asyncCall = async () => {
      const apiCall =
        ruleSetType === 'category'
          ? search().betaMerchandisingCategoryRulesetList
          : search().betaMerchandisingGlobalRulesetList;
      const result = await apiCall({
        q: searchQuery,
        start,
        rows,
      });

      if (ruleSetType === 'category') {
        setCategoryRuleSets(result.data.ruleSets as ReturnedCategoryRuleSet[]);
      }
      if (ruleSetType === 'global') {
        setGlobalRuleSets(result.data.ruleSets);
      }
      setPagination(result.data.pagination);
    };

    void asyncCall();
  }, [start, rows, ruleSetType, searchQuery, shouldRefetch]);

  return {
    categoryRuleSets,
    globalRuleSets,
    pagination: pagination,
    refetchRuleSetList: () => refetch({}),
    setCategoryRuleSets,
    setGlobalRuleSets,
  };
};
