import { useCallback, useState } from 'react';

import { merchandising, RuleSetFacetConfigWithId } from '@/libs/api';

type Product = {
  id: string;
};

export const useUpdateRuleSet = () => {
  const [error, setError] = useState('');

  const updateRuleSet = useCallback(
    async ({
      categoryId,
      facets,
      id,
      isEnabled,
      pinnedProducts,
    }: {
      categoryId: string;
      facets?: Array<RuleSetFacetConfigWithId>;
      id: string;
      isEnabled: boolean;
      pinnedProducts: Product[];
    }) => {
      setError('');

      try {
        const body = {
          categoryId,
          facets,
          isEnabled,
          rules: {
            pinnedProducts: pinnedProducts,
            blockedProducts: [],
            boosts: { alphanumeric: [], numeric: [], product: [] },
            buries: { alphanumeric: [], numeric: [], product: [] },
          },
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
