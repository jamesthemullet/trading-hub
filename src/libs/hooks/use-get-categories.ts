import { useCallback, useState } from 'react';

import { merchandising } from '../api';

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

      // eslint-disable-next-line functional/no-try-statement
      try {
        const response = await merchandising().categoryList({
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
        setGetCategoriesError(`Failed to get categories ${error}`);
      }
    },
    []
  );

  return { getCategories, getCategoriesError };
};
