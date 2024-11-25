import { useCallback, useState } from 'react';

import { CountryCode, type MerchandisingRules, search } from '@/libs/api';

import { union, uniqBy } from 'lodash';

import { convertCountryCodeToCatalogues } from '../components/utils/convert-country-code-to-catalogues';

export const useCategoryProductSearch = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchForProduct = useCallback(
    async ({
      categoryId,
      countryCode,
      productIds,
      query,
      rows,
      searchTerms,
      start,
      merchandisingRules,
    }: {
      merchandisingRules: MerchandisingRules;
      countryCode: CountryCode;
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

        const catalogues = convertCountryCodeToCatalogues(countryCode);

        const promises = catalogues.map((catalogue) =>
          search()
            .betaMerchandisingProductCreate(merchandisingRules, {
              ...queryData,
              catalogue,
            })
            .then((response) => response.data)
        );

        const results = await Promise.all(promises);

        const combinedProducts = uniqBy(union(results), 'name');

        const totalItems = combinedProducts.reduce(
          (sum, result) => sum + (result.pagination?.totalItems ?? 0),
          0
        );

        const combinedData = {
          products: combinedProducts[0].products,
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
