import { useEffect, useState } from 'react';

import type { AttributeValuesResponse, Pagination } from '@/libs/api';
import { search } from '@/libs/api';

import { handleError } from './utils/error';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const asyncCall = async () => {
      setIsLoading(true);
      try {
        const result =
          await search().betaMerchandisingFacetAttributeValuesDetail(facetId, {
            categoryId,
            ...(searchQuery && { q: searchQuery }),
            start: 0,
            rows: 100,
          });

        setAttributeValues(result.data.values);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
        setIsLoading(false);
      } catch (error) {
        setError(handleError(error));
        setIsLoading(false);
      }
    };
    void asyncCall();
  }, [facetId, categoryId, shouldRefetch, searchQuery, error]);

  return {
    attributeValues,
    error,
    pagination: pagination,
    refetch: () => refetch({}),
    isLoading,
  };
};
