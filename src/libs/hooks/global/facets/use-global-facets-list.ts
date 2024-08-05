import { useEffect, useState } from 'react';

import { FacetsList, search } from '@/libs/api';

export const useGlobalFacetsList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<FacetsList>({
    facets: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await search().betaMerchandisingFacetList();

        const facetList = response.data;

        setFacetsList(facetList);
      } catch {
        setError('Internal Server Error');
      } finally {
        setIsLoading(false);
      }
    };
    void asyncCall();
    setIsLoading(true);
  }, []);

  return {
    facets: facetsList.facets,
    isLoading,
    error,
  };
};
