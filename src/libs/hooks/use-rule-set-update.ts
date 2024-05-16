import { useCallback, useState } from 'react';

import {
  merchandising,
  MerchandisingRules,
  RuleSetFacetConfigWithId,
} from '@/libs/api';

export const useUpdateRuleSet = () => {
  const [error, setError] = useState('');

  const updateRuleSet = useCallback(
    async ({
      categoryId,
      facets,
      id,
      isEnabled,
      merchandisingRules,
    }: {
      categoryId: string;
      facets?: Array<RuleSetFacetConfigWithId>;
      id: string;
      isEnabled: boolean;
      merchandisingRules: MerchandisingRules;
    }) => {
      setError('');

      try {
        const body = {
          categoryId,
          facets,
          isEnabled,
          rules: merchandisingRules,
        };
        const response = await merchandising().rulesetUpdate(id, body);

        return response.data;
      } catch (error) {
        if (error && typeof error === 'object' && 'status' in error) {
          setError(`PUT status ${error.status}`);
          return;
        }
      }
    },
    []
  );

  return { updateRuleSet, error };
};
