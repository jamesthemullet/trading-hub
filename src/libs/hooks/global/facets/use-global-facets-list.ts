import { useEffect, useState } from 'react';

import type { MerchandisingFacetsList } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalFacetsList = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const [shouldRefetch, refetch] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<MerchandisingFacetsList>({
    facets: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const asyncCall = async () => {
      try {
        const response = await search().betaMerchandisingFacetList();

        const facetList = response.data;

        setFacetsList(facetList);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setIsLoading(false);
      }
    };
    void asyncCall();
    setIsLoading(true);
  }, [shouldRefetch, enabled]);

  return {
    facets: facetsList.facets,
    isLoading,
    error,
    onRefreshFacetList: () => refetch({}),
  };
};
