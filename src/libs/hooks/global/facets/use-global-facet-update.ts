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
    ({ facetId, data, version }: HandleGlobalFacetUpdateArgs) =>
      runUpdate({
        version,
        entity: 'facet',
        update: (lockVersion) =>
          search().merchandisingV1FacetUpdate('CLOTHING_AND_HOME', facetId, {
            ...data,
            version: lockVersion,
          }),
      }),
    [runUpdate]
  );

  return { handleGlobalFacetUpdate, error };
};
