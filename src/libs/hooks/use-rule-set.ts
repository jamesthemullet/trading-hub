import { useEffect, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingPagination,
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingReturnedGlobalRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';

import { handleError } from './utils/error';

export const useRuleSet = (
  searchQuery: string,
  start: number,
  rows: number,
  ruleSetType: 'category' | 'global'
): {
  categoryRuleSets: Array<MerchandisingReturnedCategoryRuleSet>;
  globalRuleSets: Array<MerchandisingReturnedGlobalRuleSet>;
  pagination: MerchandisingPagination;
  error: string;
  isLoading: boolean;
  refetchRuleSetList: (params: {
    countryCode?: MerchandisingCountryCode;
  }) => void;
  setCategoryRuleSets: React.Dispatch<
    React.SetStateAction<Array<MerchandisingReturnedCategoryRuleSet>>
  >;
  setGlobalRuleSets: React.Dispatch<
    React.SetStateAction<Array<MerchandisingReturnedGlobalRuleSet>>
  >;
} => {
  const [shouldRefetch, refetch] = useState({});
  const [categoryRuleSets, setCategoryRuleSets] = useState<
    Array<MerchandisingReturnedCategoryRuleSet>
  >([]);
  const [globalRuleSets, setGlobalRuleSets] = useState<
    Array<MerchandisingReturnedGlobalRuleSet>
  >([]);
  const [pagination, setPagination] = useState<MerchandisingPagination>({
    totalItems: 0,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<MerchandisingCountryCode>();

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
            result.data.ruleSets as MerchandisingReturnedCategoryRuleSet[]
          );
        }
        if (ruleSetType === 'global') {
          setGlobalRuleSets(result.data.ruleSets);
        }
        setPagination(result.data.pagination);
      } catch (error) {
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
    pagination,
    refetchRuleSetList: ({
      countryCode,
    }: {
      countryCode?: MerchandisingCountryCode;
    }) => {
      setCountryCode(countryCode);
      refetch({});
    },
    setCategoryRuleSets,
    setGlobalRuleSets,
    isLoading,
  };
};
