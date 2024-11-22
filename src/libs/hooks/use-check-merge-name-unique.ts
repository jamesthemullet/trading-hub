import { useState } from 'react';

import { search } from '@/libs/api';

export const useCheckMergeNameUnique = () => {
  const [error, setError] = useState('');

  const checkMergeNameUnique = async ({
    facetId,
    searchQuery,
    categoryId,
    exceptions,
    localAttributeValues = [],
  }: {
    facetId: string;
    searchQuery: string;
    localAttributeValues?: string[];
    categoryId?: string;
    exceptions?: (string | undefined)[];
  }) => {
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
          (!result.data.values.some(
            (item) => item.displayValue.trim() === searchQuery.trim()
          ) &&
            !localAttributeValues.some(
              (item) => item.trim() === searchQuery.trim()
            )) ||
            exceptions?.some((item) => item?.trim() === searchQuery.trim())
        ),
      };
    } catch {
      setError(`Failed to get Facet Attribute Values`);
      return {
        isUniqueValue: false,
      };
    }
  };

  return {
    error,
    checkMergeNameUnique,
  };
};
