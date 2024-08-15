import { useCallback, useState } from 'react';

import { type MerchandisingRules, search } from '@/libs/api';

export const useCategoryProductSearch = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);

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
        setIsLoading(false);
        return response.data;
      } catch (error) {
        setError(`Failed to search products ${error}`);
        setIsLoading(false);
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

  return { searchForProduct, error, isLoading };
};
