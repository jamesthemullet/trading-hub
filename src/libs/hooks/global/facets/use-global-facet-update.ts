import { useCallback, useState } from 'react';

import type { MerchandisingFacetConfig } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalFacetUpdate = () => {
  const [error, setError] = useState('');

  const handleGlobalFacetUpdate = useCallback(
    async ({
      facetId,
      data,
    }: {
      facetId: string;
      data: MerchandisingFacetConfig;
    }) => {
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
