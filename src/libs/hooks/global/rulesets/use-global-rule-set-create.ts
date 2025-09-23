import { useCallback, useState } from 'react';

import type { MerchandisingRuleSet } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createGlobalRuleSet = useCallback(async () => {
    setError('');

    try {
      const body: MerchandisingRuleSet = {
        facets: [],
        isEnabled: false,
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: {
            alphanumeric: [],
            numeric: [],
            product: [],
          },
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
        countryCode: 'UK_IE',
      };
      const response =
        await search().betaMerchandisingGlobalRulesetCreate(body);
      return response.data;
    } catch (error) {
      setError(handleError(error));
    }
  }, []);

  return { createGlobalRuleSet, error };
};
