import { useMemo } from 'react';

import type { MerchandisingRuleSet } from '@/libs/api';

type OverwrittenProductRules = {
  totalOverwrittenRules: number;
  areAllSelectedProductsBlocked: boolean;
  areAllSelectedProductsBoosted: boolean;
  areAllSelectedProductsBuried: boolean;
};

/**
 * Determines how many of the currently selected products already have an
 * existing pin/boost/bury/block rule that a bulk action would overwrite.
 */
export const useOverwrittenProductRules = (
  ruleset: MerchandisingRuleSet,
  selectedProducts: string[]
): OverwrittenProductRules =>
  useMemo(() => {
    const isSelected = ({ id }: { id: string }) =>
      selectedProducts.includes(id);

    const overwrittenPinnedRules =
      ruleset.rules.pinnedProducts.filter(isSelected);
    const overwrittenBoostRules =
      ruleset.rules.boosts.product.filter(isSelected);
    const overwrittenBuryRules =
      ruleset.rules.buries.product.filter(isSelected);
    const overwrittenBlockedRules =
      ruleset.rules.blockedProducts.filter(isSelected);

    const totalOverwrittenRules =
      overwrittenPinnedRules.length +
      overwrittenBlockedRules.length +
      overwrittenBoostRules.length +
      overwrittenBuryRules.length;

    return {
      totalOverwrittenRules,
      areAllSelectedProductsBlocked:
        selectedProducts.length > 0 &&
        selectedProducts.length === overwrittenBlockedRules.length,
      areAllSelectedProductsBoosted:
        selectedProducts.length > 0 &&
        selectedProducts.length === overwrittenBoostRules.length,
      areAllSelectedProductsBuried:
        selectedProducts.length > 0 &&
        selectedProducts.length === overwrittenBuryRules.length,
    };
  }, [ruleset, selectedProducts]);
