import { useEffect, useMemo, useState } from 'react';

import type { ReturnedCategoryRuleSet } from '@/libs/api';
import { search } from '@/libs/api';

import { validateErrorResponse } from '../../utils/error';

export const useRuleSetDetail = (id: string) => {
  const [shouldRefetch, refetch] = useState({});
  const api = useMemo(() => search(), []);
  const [ruleSetDetail, setRuleSetDetail] = useState<ReturnedCategoryRuleSet>({
    categoryId: '',
    categoryName: '',
    categoriesInfo: [
      {
        id: '',
      },
    ],
    id: '',
    isEnabled: false,
    lastChanged: {
      date: '',
      user: '',
    },
    rules: {
      pinnedProducts: [],
      blockedProducts: [],
      boosts: { alphanumeric: [], numeric: [], product: [] },
      buries: {
        alphanumeric: [],
        numeric: [],
        product: [],
      },
      includes: {
        alphanumeric: [],
      },
      excludes: {
        alphanumeric: [],
      },
    },
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await api.betaMerchandisingCategoryRulesetDetail(id);

        const data = response.data;

        setRuleSetDetail(data);
        setError('');
      } catch (error) {
        setError(validateErrorResponse(error));
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api, shouldRefetch]);

  return { ruleSetDetail, error, isLoading, refreshRuleset: () => refetch({}) };
};
