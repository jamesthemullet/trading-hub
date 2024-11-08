import { useCallback, useState } from 'react';

import { CountryCode, search } from '../api';
import { convertCountryCodeToCatalogue } from '../components/utils/convert-country-code-to-catalogue';

export const useGetCategories = () => {
  const [getCategoriesError, setGetCategoriesError] = useState('');

  const getCategories = useCallback(
    async ({
      query,
      start,
      rows,
      countryCodes,
    }: {
      query?: string;
      start: number;
      rows: number;
      countryCodes: CountryCode[];
    }) => {
      setGetCategoriesError('');

      try {
        const promises = countryCodes.map((code) =>
          search()
            .betaMerchandisingCategoryList({
              q: query,
              start,
              rows,
              catalogue: convertCountryCodeToCatalogue(code),
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
