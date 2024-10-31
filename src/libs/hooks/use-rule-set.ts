import { useEffect, useState } from 'react';

import type {
  CountryCode,
  Pagination,
  ReturnedCategoryRuleSet,
  ReturnedGlobalRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';

import { handleError } from './utils/error';

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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>();

  useEffect(() => {
    const asyncCall = async () => {
      try {
        setIsLoading(true);
        const apiCall =
          ruleSetType === 'category'
            ? search().betaMerchandisingCategoryRulesetList
            : search().betaMerchandisingGlobalRulesetList;
        const result = await apiCall({
          q: searchQuery,
          start,
          rows,
          countryCode,
        });

        if (ruleSetType === 'category') {
          setCategoryRuleSets(
            result.data.ruleSets as ReturnedCategoryRuleSet[]
          );
        }
        if (ruleSetType === 'global') {
          setGlobalRuleSets(result.data.ruleSets);
        }
        setPagination(result.data.pagination);
      } catch (error) {
        // istanbul ignore next
        setError(handleError(error));
      } finally {
        setIsLoading(false);
      }
    };

    void asyncCall();
  }, [
    start,
    rows,
    ruleSetType,
    searchQuery,
    shouldRefetch,
    setError,
    setIsLoading,
    countryCode,
  ]);

  return {
    categoryRuleSets,
    error,
    globalRuleSets,
    pagination: pagination,
    refetchRuleSetList: ({ countryCode }: { countryCode?: CountryCode }) => {
      setCountryCode(countryCode);
      refetch({});
    },
    setCategoryRuleSets,
    setGlobalRuleSets,
    isLoading,
  };
};
