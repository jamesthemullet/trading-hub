import { useEffect, useState } from 'react';

import { FacetsList, search } from '@/libs/api';

export const useFacetsList = (categoryId?: string[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<FacetsList>({
    facets: [],
  });
  const [error, setError] = useState('');

  // workaround for categoryId being an array and leading to infinite loop
  const jsonCategoryId = JSON.stringify(categoryId || []);
  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await search().betaMerchandisingFacetList({
          ...JSON.parse(jsonCategoryId),
        });

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
  }, [jsonCategoryId]);

  return {
    facets: facetsList.facets,
    isLoading,
    error,
  };
};
