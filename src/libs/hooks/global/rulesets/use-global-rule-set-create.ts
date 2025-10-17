import { useCallback, useState } from 'react';

import type { MerchandisingRuleSet } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalRuleSetCreate = () => {
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
          await search().betaMerchandisingGlobalRulesetCreate(body);
        return response.data;
      } catch (error) {
        setError(handleError(error));
      }
    },
    []
  );

  return { createGlobalRuleSet, error };
};
