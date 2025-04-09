import { useEffect, useState } from 'react';

import type { MerchandisingReturnedFacet } from '@/libs/api';
import { search } from '@/libs/api';

export const useGetFacetsById = (facetId: string) => {
  const [facet, setFacet] = useState<MerchandisingReturnedFacet>();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!facetId) {
      return;
    }

    const asyncCall = async () => {
      try {
        const response = await search().betaMerchandisingFacetDetail(facetId);

        const facetDetail = response.data;

        setFacet(facetDetail);
      } catch {
        setError('Internal Server Error');
        return;
      }
    };
    void asyncCall();
  }, [facetId]);

  return {
    facet,
    error,
  };
};
