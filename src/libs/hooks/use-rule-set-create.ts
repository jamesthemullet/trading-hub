import { useCallback, useState } from 'react';

import { merchandising } from '../api';
import type { MerchandisingRules, RuleSetFacetConfigWithId } from '../api';

export const useRuleSetCreate = () => {
  const [error, setError] = useState('');

  const handlePost = useCallback(
    async ({
      categoryId,
      facets,
      merchandisingRules,
    }: {
      categoryId: string;
      facets?: Array<RuleSetFacetConfigWithId>;
      merchandisingRules: MerchandisingRules;
    }) => {
      setError('');

      try {
        const body = {
          facets,
          categoryId,
          isEnabled: true,
          rules: merchandisingRules,
        };
        const response = await merchandising().rulesetCreate(body);
        return response.data;
      } catch (error) {
        setError(`Failed to create ruleset ${error}`);
      }
    },
    []
  );

  return { handlePost, error };
};
