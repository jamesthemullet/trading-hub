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
      merchandisingRules: MerchandisingRules;
      categoryId?: string;
      productIds?: string[];
      query?: string;
      rows?: number;
      start?: number;
    }) => {
      setError('');

      try {
        const queryData = {
          ...(query && { q: query }),
          ...(!productIds && { rows }),
          ...(!productIds && { start }),
          ...(categoryId && { categoryId }),
          ...(productIds && { productId: productIds }),
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
