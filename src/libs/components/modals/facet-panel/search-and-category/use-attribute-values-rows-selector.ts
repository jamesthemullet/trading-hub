import { useMemo } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { useGetFacetAttributeValues } from '@/libs/hooks/use-get-facet-attribute-values';

import { uniq } from 'lodash';

import type {
  AttributeDisplayType,
  AttributeRowDisplayValue,
  BaseDisplayValueMeta,
} from '../types';
import type { AttributeToMergeGroupMap } from '../utils/get-attribute-to-merge-group-map';
import { getAttributeToMergeGroupMap } from '../utils/get-attribute-to-merge-group-map';

const defaultMeta: BaseDisplayValueMeta = {
  isBeginningOfDisplayTypeGroup: false,
  isEndOfDisplayTypeGroup: false,
};

const truthy = <T>(x: T | undefined): x is T => x !== undefined;

const getMergeType = (
  attributeToMergeGroupMap: AttributeToMergeGroupMap,
  displayValue: string
) => {
  const mergeGroup = attributeToMergeGroupMap[displayValue];
  if (mergeGroup === undefined || mergeGroup.mergedValues.length <= 1) {
    return { type: 'UNMERGED' as const };
  }
  if (mergeGroup.mergedValues[0] === displayValue) {
    return { type: 'MERGED_FIRST_ELEMENT' as const };
  }

  return { type: 'MERGED_NON_FIRST_ELEMENT' as const };
};

export const useAttributeValuesRowsSelector = (
  facet: MerchandisingReturnedGlobalFacet,
  searchQuery: string,
  countryCode: MerchandisingCountryCode,
  categories?: string[]
) => {
  const {
    attributeValues,
    error: attributeValuesError,
    isLoading,
  } = useGetFacetAttributeValues({
    facetId: facet.id,
    query: searchQuery,
    categories,
    countryCode,
  });

  const attributeValuesState = useMemo(() => {
    const attributeToMergeGroupMap = getAttributeToMergeGroupMap(
      facet.merged ?? []
    );

    const rawBoostedAttributeValues = facet.boosted ?? [];
    const boostedFromMerged: string[] = facet.merged
      ? facet.merged
          .filter(
            (merged) =>
              merged?.displayValue &&
              rawBoostedAttributeValues.includes(merged.displayValue)
          )
          .reduce<string[]>((acc, merged) => {
            return [...acc, ...(merged?.mergedValues || [])];
          }, [])
      : [];
    const boostedAttributeValues = uniq([
      ...rawBoostedAttributeValues,
      ...boostedFromMerged,
    ]);

    const excludedAttributeValues = facet.excludedValues ?? [];

    const defaultAttributeValues = attributeValues
      .map((val) => val.displayValue)
      .filter((displayValue) => {
        const groupDisplayValue =
          attributeToMergeGroupMap[displayValue]?.displayValue;
        const isBoosted = boostedAttributeValues.includes(displayValue);
        const isExcluded = excludedAttributeValues.includes(displayValue);
        const isBoostedTroughGroup =
          groupDisplayValue !== undefined &&
          boostedAttributeValues.includes(groupDisplayValue);
        const isExcludedTroughGroup =
          groupDisplayValue !== undefined &&
          excludedAttributeValues.includes(groupDisplayValue);
        return (
          !isBoosted &&
          !isBoostedTroughGroup &&
          !isExcluded &&
          !isExcludedTroughGroup
        );
      });

    const mapper =
      (facetValueType: AttributeDisplayType) => (displayValue: string) => {
        const mergeInfo = getMergeType(attributeToMergeGroupMap, displayValue);

        if (mergeInfo.type === 'UNMERGED') {
          return {
            id: displayValue,
            meta: defaultMeta,
            mergeType: 'unmerged' as const,
            displayValue:
              attributeToMergeGroupMap[displayValue] !== undefined
                ? attributeToMergeGroupMap[displayValue].displayValue
                : displayValue,
            displayType: facetValueType,
          };
        } else if (mergeInfo.type === 'MERGED_FIRST_ELEMENT') {
          return {
            id: displayValue,
            meta: defaultMeta,
            ...attributeToMergeGroupMap[displayValue],
            mergeType: 'merged' as const,
            displayType: facetValueType,
          };
        }
        return undefined;
      };

    const beginningAndEndMapper = (
      row: AttributeRowDisplayValue,
      index: number,
      array: AttributeRowDisplayValue[]
    ) => {
      return {
        ...row,
        meta: {
          ...row.meta,
          isBeginningOfDisplayTypeGroup: index === 0,
          isEndOfDisplayTypeGroup: index === array.length - 1,
        },
      };
    };

    const inSearchQuery = (row: AttributeRowDisplayValue) => {
      if (!searchQuery) {
        return true;
      }

      if (row.mergeType === 'merged') {
        if (
          row.mergedValues.some((val) =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
          )
        ) {
          return true;
        }
      }

      if (row.displayValue.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }

      return false;
    };

    const boostedResult = boostedAttributeValues
      .map(mapper('boosted'))
      .filter(truthy)
      .filter(inSearchQuery)
      .map(beginningAndEndMapper);

    const defaultResult = defaultAttributeValues
      .map(mapper('default'))
      .filter(truthy)
      .map(beginningAndEndMapper);

    const excludedResult = excludedAttributeValues
      .map(mapper('excluded'))
      .filter(truthy)
      .filter(inSearchQuery)
      .map(beginningAndEndMapper);

    const rows: AttributeRowDisplayValue[] = [
      ...boostedResult,
      ...defaultResult,
      ...excludedResult,
    ];
    return rows;
  }, [attributeValues, searchQuery, facet]);

  return {
    attributeValues,
    attributeValuesState,
    error: attributeValuesError,
    isLoading,
  };
};
