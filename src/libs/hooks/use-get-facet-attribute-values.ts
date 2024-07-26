import { useEffect, useState } from 'react';

import type { AttributeValuesResponse, Pagination } from '@/libs/api';
import { search } from '@/libs/api';

export const useGetFacetAttributeValues = (
  facetId: string,
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
            start: 1,
            rows: 100,
          });

        setAttributeValues(result.data.values);
        result.data.pagination && setPagination(result.data.pagination);
      } catch (error) {
        setError(`Failed to get Facet Attribute Values`);
      }
    };
    void asyncCall();
  }, [facetId, categoryId, shouldRefetch]);

  return {
    attributeValues,
    error,
    pagination: pagination,
    refetch: () => refetch({}),
  };
};
