import { useCallback } from 'react';

import type {
  MerchandisingFacetConfig,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { search } from '@/libs/api';
import {
  type SaveResult,
  useOptimisticUpdate,
} from '@/libs/hooks/use-optimistic-update';

type HandleGlobalFacetUpdateArgs = {
  facetId: string;
  data: MerchandisingFacetConfig;
  version?: number;
  shouldUseV1?: boolean;
};

export type UseGlobalFacetUpdate = {
  handleGlobalFacetUpdate: (
    params: HandleGlobalFacetUpdateArgs
  ) => Promise<SaveResult<MerchandisingReturnedGlobalFacet>>;
  error: string;
};

export const useGlobalFacetUpdate = (): UseGlobalFacetUpdate => {
  const { error, runUpdate } =
    useOptimisticUpdate<MerchandisingReturnedGlobalFacet>();

  const handleGlobalFacetUpdate = useCallback(
    ({
      facetId,
      data,
      version,
      shouldUseV1 = false,
    }: HandleGlobalFacetUpdateArgs) =>
      runUpdate({
        shouldUseV1,
        version,
        entity: 'facet',
        betaUpdate: () => search().betaMerchandisingFacetUpdate(facetId, data),
        v1Update: (lockVersion) =>
          search().merchandisingV1FacetUpdate('CLOTHING_AND_HOME', facetId, {
            ...data,
            version: lockVersion,
          }),
      }),
    [runUpdate]
  );

  return { handleGlobalFacetUpdate, error };
};
