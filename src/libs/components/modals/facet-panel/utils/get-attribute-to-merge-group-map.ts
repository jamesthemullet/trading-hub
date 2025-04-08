import type { GlobalOnlyFacetConfig, ReturnedGlobalFacet } from '@/libs/api';

type MergeGroup = Required<
  NonNullable<GlobalOnlyFacetConfig['merged']>[number]
>;
export type AttributeToMergeGroupMap = Record<string, MergeGroup>;

export const getAttributeToMergeGroupMap = (
  merged: NonNullable<ReturnedGlobalFacet['merged']>
) => {
  return merged.reduce<AttributeToMergeGroupMap>((acc, merged) => {
    const mergedValues = merged.mergedValues ?? [];
    const displayValue = merged.displayValue ?? '';
    mergedValues.forEach((value) => {
      // eslint-disable-next-line functional/immutable-data
      acc[value] = {
        mergedValues,
        displayValue,
      };
    });
    return acc;
  }, {});
};
