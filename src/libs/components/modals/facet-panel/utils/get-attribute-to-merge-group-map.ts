import type {
  MerchandisingGlobalOnlyFacetConfig,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';

type MergeGroup = Required<
  NonNullable<MerchandisingGlobalOnlyFacetConfig['merged']>[number]
>;
export type AttributeToMergeGroupMap = Record<string, MergeGroup>;

export const getAttributeToMergeGroupMap = (
  merged: NonNullable<MerchandisingReturnedGlobalFacet['merged']>
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
