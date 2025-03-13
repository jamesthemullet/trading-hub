import { useMemo } from 'react';

import type { ReturnedFacet } from '@/libs/api';

import type {
  FacetDisplayType,
  FacetPanelState,
  FacetRowDisplayValue,
} from './facets-panel-reducer';

const truthy = <T>(x: T | undefined): x is T => x !== undefined;

export const useFacetsRowsSelector = (
  panelState: FacetPanelState,
  facetsData: ReturnedFacet[]
) => {
  const facetsState = useMemo(() => {
    const includedFacets = panelState.includedFacets;
    const excludedFacets = panelState.excludedFacets;

    const defaultFacets = facetsData.filter(({ id }) => {
      const isIncluded = includedFacets.includes(id);
      const isExcluded = excludedFacets.includes(id);
      return !isIncluded && !isExcluded;
    });

    const displayTypeMapper =
      (displayType: FacetDisplayType) => (row: ReturnedFacet) => {
        return {
          ...row,
          displayType,
        };
      };

    const beginningAndEndMapper = (
      row: FacetRowDisplayValue,
      index: number,
      array: FacetRowDisplayValue[]
    ) => {
      return {
        ...row,
        meta: {
          isBeginningOfDisplayTypeGroup: index === 0,
          isEndOfDisplayTypeGroup: index === array.length - 1,
        },
      };
    };

    const includedResult = includedFacets
      .map((id) => facetsData.find((facet) => facet.id === id))
      .filter(truthy)
      .map(displayTypeMapper('included'))
      .map(beginningAndEndMapper);

    const defaultResult = defaultFacets
      .map(displayTypeMapper('algoControl'))
      .map(beginningAndEndMapper);

    const excludedResult = excludedFacets
      .map((id) => facetsData.find((facet) => facet.id === id))
      .filter(truthy)
      .map(displayTypeMapper('excluded'))
      .map(beginningAndEndMapper);

    const rows: FacetRowDisplayValue[] = [
      ...includedResult,
      ...defaultResult,
      ...excludedResult,
    ];
    return rows;
  }, [facetsData, panelState]);

  const includedFacets = useMemo<ReturnedFacet[]>(
    () =>
      facetsState
        .filter((facet) => facet.displayType === 'included')
        .map((facet: FacetRowDisplayValue) => {
          // removing displayType and meta from the facet
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { displayType, meta, ...rest } = facet;
          return rest;
        }),
    [facetsState]
  );
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
