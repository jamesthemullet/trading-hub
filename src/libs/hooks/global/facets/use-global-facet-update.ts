import { useCallback, useState } from 'react';

import type {
  MerchandisingFacetConfig,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

type ErrorResult = { status: 'error' };

export type UseGlobalFacetUpdate = {
  handleGlobalFacetUpdate: (params: {
    facetId: string;
    data: MerchandisingFacetConfig;
  }) => Promise<MerchandisingReturnedGlobalFacet | ErrorResult>;
  error: string;
};

export const useGlobalFacetUpdate = (): UseGlobalFacetUpdate => {
  const [error, setError] = useState('');

  const handleGlobalFacetUpdate = useCallback(
    async ({
      facetId,
      data,
    }: {
      facetId: string;
      data: MerchandisingFacetConfig;
    }): Promise<MerchandisingReturnedGlobalFacet | ErrorResult> => {
      setError('');
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
