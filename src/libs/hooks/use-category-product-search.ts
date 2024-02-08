import { useCallback, useState } from 'react';

import { merchandising } from '@/libs/api';

export const useCategoryProductSearch = () => {
  const [error, setError] = useState('');

  const handleGet = useCallback(
    async ({
      categoryId,
      query,
      rows,
      start,
    }: {
      categoryId: string;
      query: string;
      rows: number;
      start: number;
    }) => {
      setError('');

      // eslint-disable-next-line functional/no-try-statement
      try {
        const queryData = {
          query,
          rows,
          start,
          categoryIds: [categoryId],
        };
        const response = await merchandising().productList(queryData);
        return response.data;
      } catch (error) {
        setError(`Failed to create ruleset ${error}`);
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

  return { handleGet, error };
};
