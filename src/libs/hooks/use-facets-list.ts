import { useEffect, useState } from 'react';

import { FacetsList, merchandising } from '@/libs/api';

export const useFacetsList = (categoryId?: string[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<FacetsList>({
    facets: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await merchandising().facetList({ categoryId });

        const facetList = response.data;

        setFacetsList(facetList);
      } catch (error: unknown) {
        setError('Internal Server Error');
      } finally {
        setIsLoading(false);
      }
    };
    void asyncCall();
    setIsLoading(true);
  }, [categoryId]);

  return {
    facets: facetsList.facets,
    isLoading,
    error,
  };
};
