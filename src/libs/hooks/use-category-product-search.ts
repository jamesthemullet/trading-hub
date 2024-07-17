import { useCallback, useState } from 'react';

import { type MerchandisingRules, search } from '@/libs/api';

export const useCategoryProductSearch = () => {
  const [error, setError] = useState('');

  const searchForProduct = useCallback(
    async ({
      categoryId,
      productIds,
      query,
      rows,
      start,
      merchandisingRules,
    }: {
      categoryId?: string;
      query: string;
      rows: number;
      start: number;
      merchandisingRules: MerchandisingRules;
      productIds?: string[];
    }) => {
      setError('');

      try {
        const queryData = {
          q: query,
          rows,
          start,
          ...(categoryId && { categoryId }),
          ...(productIds && { productIds }),
        };

        const response = await search().betaMerchandisingProductCreate(
          merchandisingRules,
          queryData
        );
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
