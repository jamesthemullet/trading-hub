import { useEffect, useState } from 'react';

import type { AttributeValuesResponse, Pagination } from '@/libs/api';
import { search } from '@/libs/api';

import { validateErrorResponse } from './utils/error';

export const useGetFacetAttributeValues = (
  facetId: string,
  searchQuery?: string,
  categoryId?: string
) => {
  const [shouldRefetch, refetch] = useState({});
  const [attributeValues, setAttributeValues] = useState<
    AttributeValuesResponse['values']
  >([]);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ totalItems: 0 });

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const result =
          await search().betaMerchandisingFacetAttributeValuesDetail(facetId, {
            categoryId,
            q: searchQuery,
            start: 0,
            rows: 100,
          });

        setAttributeValues(result.data.values);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      } catch {
        setError(validateErrorResponse(error));
      }
    };
    void asyncCall();
  }, [facetId, categoryId, shouldRefetch, searchQuery, error]);

  return {
    attributeValues,
    error,
    pagination: pagination,
    refetch: () => refetch({}),
  };
};
