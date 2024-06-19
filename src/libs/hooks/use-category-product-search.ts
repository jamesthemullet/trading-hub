import { useCallback, useState } from 'react';

import { merchandising, type MerchandisingRules } from '@/libs/api';

export const useCategoryProductSearch = () => {
  const [error, setError] = useState('');

  const searchForProduct = useCallback(
    async ({
      categoryId,
      query,
      rows,
      start,
      merchandisingRules,
    }: {
      categoryId: string;
      query: string;
      rows: number;
      start: number;
      merchandisingRules: MerchandisingRules;
    }) => {
      setError('');

      try {
        const queryData = {
          q: query,
          rows,
          start,
          categoryIds: [categoryId],
        };
        const response = await merchandising().productCreate(queryData, {
          pinnedProducts: merchandisingRules.pinnedProducts,
          blockedProducts: merchandisingRules.blockedProducts,
          boosts: merchandisingRules.boosts,
          buries: merchandisingRules.buries,
        });
        return response.data;
      } catch (error) {
        setError(`Failed to search products ${error}`);
      }

      return {
        products: [],
        pagination: {
          totalItems: 0,
        },
      };
    },
    []
  );

  return { searchForProduct, error };
};
