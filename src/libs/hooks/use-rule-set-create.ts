import { useCallback, useState } from 'react';

import { merchandising } from '../api';
import type { MerchandisingRules } from '../api';

export const useRuleSetCreate = () => {
  const [error, setError] = useState('');

  const handlePost = useCallback(
    async ({
      categoryId,
      merchandisingRules,
    }: {
      categoryId: string;
      merchandisingRules: MerchandisingRules;
    }) => {
      setError('');

      try {
        const body = {
          categoryId,
          isEnabled: true,
          rules: {
            pinnedProducts: merchandisingRules.pinnedProducts,
            boosts: { numeric: [], alphaNumeric: [], product: [] },
            buries: { numeric: [], alphaNumeric: [], product: [] }
          },
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
