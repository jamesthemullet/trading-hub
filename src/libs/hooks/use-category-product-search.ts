import { useCallback, useState } from 'react';

import type { MerchandisingCountryCode, MerchandisingRules } from '@/libs/api';
import { search } from '@/libs/api';

import { uniqBy } from 'lodash';

import {
  convertCategoryIdToCatalogue,
  convertCountryCodeToCatalogues,
} from '../components/utils/convert-country-code-to-catalogues';

export const useCategoryProductSearch = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchForProduct = useCallback(
    async ({
      categories,
      countryCode,
      productIds,
      query,
      rows,
      searchTerms,
      start,
      merchandisingRules,
    }: {
      merchandisingRules: MerchandisingRules;
      countryCode: MerchandisingCountryCode;
      categories?: string[];
      productIds?: string[];
      query?: string;
      rows?: number;
      searchTerms?: string[];
      start?: number;
    }) => {
      setError('');
      setIsLoading(true);

      try {
        const catalogues = convertCountryCodeToCatalogues(countryCode);
        const promises = categories?.length
          ? categories.map((categoryId) =>
              search()
                .betaMerchandisingProductCreate(merchandisingRules, {
                  ...(query && { q: query }),
                  ...(!productIds && { rows }),
                  ...(!productIds && { start }),
                  categoryId,
                  catalogue: convertCategoryIdToCatalogue(categoryId),
                })
                .then((response) => response.data)
            )
          : catalogues.map((catalogue) =>
              search()
                .betaMerchandisingProductCreate(merchandisingRules, {
                  ...(query && { q: query }),
                  ...(productIds && { productId: productIds }),
                  ...(!productIds && { rows }),
                  ...(!productIds && { start }),
                  merchandisingSearchTerm: searchTerms,
                  catalogue,
                })
                .then((response) => response.data)
            );

        const results = await Promise.all(promises);

        const products = results.flatMap((res) => res.products);
        const totalItems = results
          .map((res) => res.pagination.totalItems ?? 0)
          .reduce((max, current) => Math.max(max, current), 0);

        const combinedData = {
          products: uniqBy(products, 'id'),
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
