import { useCallback, useState } from 'react';

import { CountryCode, type MerchandisingRules, search } from '@/libs/api';

import { convertCountryCodeToCatalogue } from '../components/utils/convert-country-code-to-catalogue';

export const useCategoryProductSearch = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchForProduct = useCallback(
    async ({
      categoryId,
      countryCodes,
      productIds,
      query,
      rows,
      searchTerms,
      start,
      merchandisingRules,
    }: {
      merchandisingRules: MerchandisingRules;
      countryCodes: CountryCode[];
      categoryId?: string;
      productIds?: string[];
      query?: string;
      rows?: number;
      searchTerms?: string[];
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
          ...(searchTerms && { merchandisingSearchTerm: searchTerms }),
          ...(productIds && { productId: productIds }),
        };

        const promises = countryCodes.map((code) =>
          search()
            .betaMerchandisingProductCreate(merchandisingRules, {
              ...queryData,
              catalogue: convertCountryCodeToCatalogue(code),
            })
            .then((response) => response.data)
        );

        const results = await Promise.all(promises);

        const combinedProducts = results.flatMap((result) => result.products);

        const totalItems = results.reduce(
          (sum, result) => sum + (result.pagination?.totalItems ?? 0),
          0
        );

        const combinedData = {
          products: combinedProducts,
          pagination: {
            totalItems,
          },
        };

        setIsLoading(false);

        return combinedData;
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
