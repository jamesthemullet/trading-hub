import { useState } from 'react';

import { search } from '@/libs/api';

export const useCheckMergeNameUnique = () => {
  const [error, setError] = useState('');

  const checkMergeNameUnique = async (
    facetId: string,
    searchQuery: string,
    categoryId?: string
  ) => {
    try {
      const result = await search().betaMerchandisingFacetAttributeValuesDetail(
        facetId,
        {
          categoryId,
          q: searchQuery,
          start: 0,
          rows: 100,
        }
      );

      return {
        isUniqueValue: Boolean(
          !result.data.values.some(
            (item) => item.displayValue.trim() === searchQuery.trim()
          )
        ),
      };
    } catch {
      setError(`Failed to get Facet Attribute Values`);
    }
  };

  return {
    error,
    checkMergeNameUnique,
  };
};
