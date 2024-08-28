import { useEffect, useMemo, useState } from 'react';

import type { ReturnedGlobalRuleSet } from '@/libs/api';
import { search } from '@/libs/api';

import { validateErrorResponse } from '../../utils/error';

export const useGlobalRuleSetDetail = (id: string) => {
  const api = useMemo(() => search(), []);
  const [globalRuleSet, setGlobalRuleSet] = useState<ReturnedGlobalRuleSet>({
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
    facets: [],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await api.betaMerchandisingGlobalRulesetDetail(id);

        const data = response.data;

        setGlobalRuleSet(data);
        setError('');
      } catch (error) {
        setError(validateErrorResponse(error));
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api]);

  return { globalRuleSet, error, isLoading };
};
