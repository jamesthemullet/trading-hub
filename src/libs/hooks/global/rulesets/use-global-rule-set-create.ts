import { useCallback, useState } from 'react';

import type {
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalRuleSetCreate = (): {
  createGlobalRuleSet: (
    params: MerchandisingRuleSet
  ) => Promise<MerchandisingReturnedGlobalRuleSet | undefined>;
  error: string;
} => {
  const [error, setError] = useState('');

  const createGlobalRuleSet = useCallback(
    async ({
      rules,
      isEnabled,
      startDate,
      endDate,
      countryCode,
    }: MerchandisingRuleSet) => {
      setError('');

      try {
        const body: MerchandisingRuleSet = {
          facets: [],
          rules,
          isEnabled,
          startDate,
          endDate,
          countryCode,
        };
        const response =
          await search().betaMerchandisingGlobalRulesetCreate2(body);
        return response.data;
      } catch (error) {
        setError(handleError(error));
      }
    },
    []
  );

  return { createGlobalRuleSet, error };
};
