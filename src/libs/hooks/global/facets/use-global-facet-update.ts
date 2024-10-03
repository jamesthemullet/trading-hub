import { useCallback, useState } from 'react';

import { FacetConfig, search } from '@/libs/api';

import { handleError } from '../../utils/error';

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
      } catch (error) {
        setError(handleError(error));
        return { status: 'error' };
      }
    },
    []
  );

  return {
    handleGlobalFacetUpdate,
    error,
  };
};
