import { useCallback, useState } from 'react';

import type { RuleSet } from '../../../api';
import { search } from '../../../api';

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
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
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
