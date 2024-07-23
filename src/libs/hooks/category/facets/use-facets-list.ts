import { useEffect, useState } from 'react';

import { FacetsList, search } from '@/libs/api';

export const useFacetsList = (
  categoryId: string[],
  enabled: boolean = true
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<FacetsList>({
    facets: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await search().betaMerchandisingFacetList({
          categoryId,
        });

        const facetList = response.data;

        setFacetsList(facetList);
      } catch (error: unknown) {
        setError('Internal Server Error');
      } finally {
        setIsLoading(false);
      }
    };

    if (enabled) {
      setIsLoading(true);
      void asyncCall();
    }
  }, [categoryId, enabled]);

  return {
    facets: facetsList.facets,
    isLoading,
    error,
  };
};
