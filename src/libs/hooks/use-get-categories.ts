import { useCallback, useState } from 'react';

import { search } from '../api';

export const useGetCategories = () => {
  const [getCategoriesError, setGetCategoriesError] = useState('');

  const getCategories = useCallback(
    async ({
      query,
      start,
      rows,
    }: {
      query?: string;
      start: number;
      rows: number;
    }) => {
      setGetCategoriesError('');

      try {
        const response = await search().betaMerchandisingCategoryList({
          q: query,
          start,
          rows,
        });

        return response.data;
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
