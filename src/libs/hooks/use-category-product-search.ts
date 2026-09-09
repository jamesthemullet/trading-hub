import { useCallback, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingProductSearchResponse,
  MerchandisingRules,
  SearchMerchandisingProductsV1ParamsEnum,
} from '@/libs/api';
import { search } from '@/libs/api';

import uniqBy from 'lodash/uniqBy';

import {
  convertCategoryIdToCountry,
  convertCountryCodeToCountries,
} from '../utils/convert-country-code-to-countries';

export const useCategoryProductSearch = (): {
  searchForProduct: (args: {
    merchandisingRules: MerchandisingRules;
    countryCode: MerchandisingCountryCode;
    catalogue?: SearchMerchandisingProductsV1ParamsEnum;
    categories?: string[];
    productIds?: string[];
    query?: string;
    rows?: number;
    searchTerms?: string[];
    start?: number;
  }) => Promise<MerchandisingProductSearchResponse>;
  error: string;
  isLoading: boolean;
} => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchForProduct = useCallback(
    async ({
      categories,
      catalogue = 'CLOTHING_AND_HOME',
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
      catalogue?: SearchMerchandisingProductsV1ParamsEnum;
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
        const promises = categories?.length
          ? categories.map((categoryId) =>
              search()
                .searchMerchandisingProductsV1(
                  catalogue,
                  {
                    ...(query && { q: query }),
                    ...(!productIds && { rows }),
                    ...(!productIds && { start }),
                    categoryId,
                    country: convertCategoryIdToCountry(categoryId),
                  },
                  merchandisingRules
                )
                .then((response) => response.data)
            )
          : convertCountryCodeToCountries(countryCode).map((country) =>
              search()
                .searchMerchandisingProductsV1(
                  catalogue,
                  {
                    ...(query && { q: query }),
                    ...(productIds && { productId: productIds }),
                    ...(!productIds && { rows }),
                    ...(!productIds && { start }),
                    ...(searchTerms && searchTerms.length > 0
                      ? {
                          merchandisingSearchTerm: searchTerms,
                        }
                      : {}),
                    country,
                  },
                  merchandisingRules
                )
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
