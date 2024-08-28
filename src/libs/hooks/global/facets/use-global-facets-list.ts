import { useEffect, useState } from 'react';

import { FacetsList, search } from '@/libs/api';

import { validateErrorResponse } from '../../utils/error';

export const useGlobalFacetsList = () => {
  const [shouldRefetch, refetch] = useState({});
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
        setError(validateErrorResponse(error));
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
