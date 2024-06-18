import { useCallback, useState } from 'react';

import { search } from '../api';
import type { RuleSet } from '../api';

export const useGlobalRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createGlobalRuleSet = useCallback(async () => {
    setError('');

    try {
      const body: RuleSet = {
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
        },
      };
      const response =
        await search().betaMerchandisingGlobalRulesetCreate(body);
      return response.data;
    } catch (error) {
      setError(`Failed to create ruleset ${error}`);
    }
  }, []);

  return { createGlobalRuleSet, error };
};
