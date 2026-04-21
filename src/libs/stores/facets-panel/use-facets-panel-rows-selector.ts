import { useMemo, useRef } from 'react';

import type { MerchandisingReturnedFacet } from '@/libs/api';

import type {
  FacetDisplayType,
  FacetPanelState,
  FacetRowDisplayValue,
} from './facets-panel-reducer';

const truthy = <T>(x: T | undefined): x is T => x !== undefined;

type RowCacheEntry = {
  facetFingerprint: string;
  displayType: FacetDisplayType;
  isBeginningOfDisplayTypeGroup: boolean;
  isEndOfDisplayTypeGroup: boolean;
  row: FacetRowDisplayValue;
};

export const useFacetsRowsSelector = (
  panelState: FacetPanelState,
  facetsData: MerchandisingReturnedFacet[]
): {
  facetsState: FacetRowDisplayValue[];
  includedFacets: MerchandisingReturnedFacet[];
  excludedFacets: { facets: Array<{ id: string }> };
} => {
  const rowCacheRef = useRef<Map<string, RowCacheEntry>>(new Map());

  const facetsState = useMemo(() => {
    const previousCache = rowCacheRef.current;
    const nextCache = new Map<string, RowCacheEntry>();

    const facetById = new Map(facetsData.map((facet) => [facet.id, facet]));
    const includedSet = new Set(panelState.includedFacets);
    const excludedSet = new Set(panelState.excludedFacets);

    const includedIds = panelState.includedFacets.filter((id) =>
      facetById.has(id)
    );
    const excludedIds = panelState.excludedFacets.filter((id) =>
      facetById.has(id)
    );
    const defaultIds = facetsData
      .filter(({ id }) => !includedSet.has(id) && !excludedSet.has(id))
      .map((facet) => facet.id);

    const createRowsForGroup = (
      ids: string[],
      displayType: FacetDisplayType
    ): FacetRowDisplayValue[] =>
      ids
        .map((id, index) => {
          const facet = facetById.get(id);
          // ids are pre-filtered via facetById.has(id), so this is defensive only
          // istanbul ignore next
          if (!facet) {
            return undefined;
          }

          const facetFingerprint = JSON.stringify(facet);

          const isBeginningOfDisplayTypeGroup = index === 0;
          const isEndOfDisplayTypeGroup = index === ids.length - 1;

          const cached = previousCache.get(id);

          if (
            cached?.facetFingerprint === facetFingerprint &&
            cached.displayType === displayType &&
            cached.isBeginningOfDisplayTypeGroup ===
              isBeginningOfDisplayTypeGroup &&
            cached.isEndOfDisplayTypeGroup === isEndOfDisplayTypeGroup
          ) {
            // eslint-disable-next-line functional/immutable-data
            nextCache.set(id, cached);
            return cached.row;
          }

          const row: FacetRowDisplayValue = {
            ...facet,
            displayType,
            meta: {
              isBeginningOfDisplayTypeGroup,
              isEndOfDisplayTypeGroup,
            },
          };

          // eslint-disable-next-line functional/immutable-data
          nextCache.set(id, {
            facetFingerprint,
            displayType,
            isBeginningOfDisplayTypeGroup,
            isEndOfDisplayTypeGroup,
            row,
          });

          return row;
        })
        .filter(truthy);

    const rows: FacetRowDisplayValue[] = [
      ...createRowsForGroup(includedIds, 'included'),
      ...createRowsForGroup(defaultIds, 'algoControl'),
      ...createRowsForGroup(excludedIds, 'excluded'),
    ];

    // eslint-disable-next-line functional/immutable-data
    rowCacheRef.current = nextCache;

    return rows;
  }, [facetsData, panelState.excludedFacets, panelState.includedFacets]);

  const includedFacets = useMemo<MerchandisingReturnedFacet[]>(() => {
    const facetById = new Map(facetsData.map((facet) => [facet.id, facet]));

    return panelState.includedFacets
      .map((id) => facetById.get(id))
      .filter(truthy);
  }, [facetsData, panelState.includedFacets]);
  const excludedFacets = useMemo(
    () => ({
      facets: facetsState
        .filter((facet) => facet.displayType === 'excluded')
        .map((facet) => ({ id: facet.id })),
    }),
    [facetsState]
  );

  return {
    facetsState,
    includedFacets,
    excludedFacets,
  };
};
