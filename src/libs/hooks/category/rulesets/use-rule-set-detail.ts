import { useEffect, useMemo, useState } from 'react';

import type { MerchandisingReturnedCategoryRuleSet } from '@/libs/api';
import { search } from '@/libs/api';
import { EMPTY_MERCHANDISING_RULES } from '@/libs/hooks/utils/constants';
import { handleError } from '@/libs/hooks/utils/error';

export const useRuleSetDetail = (id: string, disabled = false) => {
  const [shouldRefetch, refetch] = useState({});
  const api = useMemo(() => search(), []);
  const [ruleSetDetail, setRuleSetDetail] =
    useState<MerchandisingReturnedCategoryRuleSet>({
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
      rules: structuredClone(EMPTY_MERCHANDISING_RULES),
    });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || disabled) {
      setIsLoading(false);
      return;
    }

    const asyncCall = async () => {
      try {
        const response = await api.betaMerchandisingCategoryRulesetDetail(id);

        const data = response.data;

        setRuleSetDetail(data);
        setError('');
      } catch (error) {
        setError(handleError(error));
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api, shouldRefetch, disabled]);

  return { ruleSetDetail, error, isLoading, refreshRuleset: () => refetch({}) };
};
