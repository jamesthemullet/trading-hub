import { useCallback, useState } from 'react';

import type { MerchandisingCountryCode } from '../api';
import { search } from '../api';
import { convertCountryCodeToCatalogues } from '../utils/convert-country-code-to-catalogues';

export const useGetCategories = () => {
  const [getCategoriesError, setGetCategoriesError] = useState('');

  const getCategories = useCallback(
    async ({
      query,
      start,
      rows,
      countryCode,
    }: {
      query?: string;
      start: number;
      rows: number;
      countryCode: MerchandisingCountryCode;
    }) => {
      setGetCategoriesError('');

      const catalogues = convertCountryCodeToCatalogues(countryCode);

      try {
        const promises = catalogues.map((catalogue) =>
          search()
            .betaMerchandisingCategoryList({
              q: query,
              start,
              rows,
              catalogue,
            })
            .then((response) => response.data)
        );

        const results = await Promise.all(promises);

        const combinedCategories = results.flatMap(
          (result) => result.categories
        );

        const totalItems = results.reduce(
          (sum, result) => sum + (result.pagination?.totalItems ?? 0),
          0
        );

        const combinedData = {
          categories: combinedCategories,
          pagination: {
            totalItems,
          },
        };

        return combinedData;
      } catch (error) {
        // istanbul ignore else
        if (error && typeof error === 'object' && 'status' in error) {
          setGetCategoriesError(`GET status ${error.status}`);
          return;
        }
      }
    },
    []
  );

  return { getCategories, getCategoriesError };
};
