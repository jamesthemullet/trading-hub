import type { MerchandisingReturnedFacet } from '@/libs/api';

export type CategoryInfo = { id: string; name?: string; plpUrl?: string };

export type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

type BaseDisplayValueMeta = {
  isBeginningOfDisplayTypeGroup: boolean;
  isEndOfDisplayTypeGroup: boolean;
};
export type FacetRowDisplayValue = MerchandisingReturnedFacet & {
  meta?: BaseDisplayValueMeta;
  displayType: FacetDisplayType;
};
