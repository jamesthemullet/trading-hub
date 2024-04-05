import { useCallback, useState } from 'react';

import { merchandising } from '@/libs/api';

type Product = {
  id: string;
};

export const useUpdateRuleSet = () => {
  const [error, setError] = useState('');

  const updateRuleSet = useCallback(
    async ({
      categoryId,
      pinnedProducts,
      id,
    }: {
      categoryId: string;
      id: string;
      pinnedProducts: Product[];
    }) => {
      setError('');

      try {
        const body = {
          categoryId,
          isEnabled: true,
          rules: {
            pinnedProducts: pinnedProducts,
            boosts: { numeric: [], alphaNumeric: [], product: [] },
            buries: { numeric: [], alphaNumeric: [], product: [] }
          },
        };
        const response = await merchandising().rulesetUpdate(id, body);

        return response.data;
      } catch (error) {
        if (error && typeof error === 'object' && 'status' in error) {
          setError(`PUT status ${error.status}`);
          return;
        }
        setError(`Failed to update rule set ${error}`);
      }
    },
    []
  );

  return { updateRuleSet, error };
};
