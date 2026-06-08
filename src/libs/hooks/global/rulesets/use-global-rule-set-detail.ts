import { useEffect, useMemo, useState } from 'react';

import type { MerchandisingReturnedGlobalRuleSet } from '@/libs/api';
import { search } from '@/libs/api';
import { EMPTY_MERCHANDISING_RULES } from '@/libs/hooks/utils/constants';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalRuleSetDetail = (
  id: string
): {
  globalRuleSet: MerchandisingReturnedGlobalRuleSet;
  error: string;
  isLoading: boolean;
} => {
  const api = useMemo(() => search(), []);
  const [globalRuleSet, setGlobalRuleSet] =
    useState<MerchandisingReturnedGlobalRuleSet>({
      id: '',
      isEnabled: false,
      lastChanged: {
        date: '',
        user: '',
      },
      rules: structuredClone(EMPTY_MERCHANDISING_RULES),
      facets: [],
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
        const response = await api.betaMerchandisingGlobalRulesetDetail(id);

        const data = response.data;

        setGlobalRuleSet(data);
        setError('');
      } catch (error) {
        setError(handleError(error));
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api]);

  return { globalRuleSet, error, isLoading };
};
