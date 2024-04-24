import { useEffect, useState } from 'react';

import { ReturnedFacet, merchandising } from '@/libs/api';

export const useGetFacetsById = (facetId: string) => {
  const [facet, setFacet] = useState<ReturnedFacet>();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!facetId) {
      return;
    }

    const asyncCall = async () => {
      try {
        const response = await merchandising().facetDetail(facetId);

        const facetList = response.data;

        setFacet(facetList);
      } catch (error: unknown) {
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
