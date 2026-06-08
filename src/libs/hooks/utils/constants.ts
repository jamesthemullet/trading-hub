import type { MerchandisingRules } from '@/libs/api';

export const EMPTY_MERCHANDISING_RULES: MerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { alphanumeric: [], numeric: [], product: [] },
  buries: { alphanumeric: [], numeric: [], product: [] },
  includes: { alphanumeric: [] },
  excludes: { alphanumeric: [] },
};
