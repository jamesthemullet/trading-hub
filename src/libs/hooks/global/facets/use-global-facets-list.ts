import { useEffect, useState } from 'react';

import type { MerchandisingFacetsList } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalFacetsList = () => {
  const [shouldRefetch, refetch] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<MerchandisingFacetsList>({
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
        setError(handleError(error));
      } finally {
        setIsLoading(false);
      }
    };
    void asyncCall();
    setIsLoading(true);
  }, [shouldRefetch, error]);

  return {
    facets: facetsList.facets,
    isLoading,
    error,
    onRefreshFacetList: () => refetch({}),
  };
};
