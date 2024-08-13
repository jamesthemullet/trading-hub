import { useCallback, useState } from 'react';

import { FacetConfig, search } from '@/libs/api';

export const useGlobalFacetUpdate = () => {
  const [error, setError] = useState('');

  const handleGlobalFacetUpdate = useCallback(
    async ({ facetId, data }: { facetId: string; data: FacetConfig }) => {
      try {
        const response = await search().betaMerchandisingFacetUpdate(
          facetId,
          data
        );

        return response.data;
      } catch {
        setError('Internal Server Error');
      }
    },
    []
  );

  return {
    handleGlobalFacetUpdate,
    error,
  };
};
