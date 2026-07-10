import type { DiffItem } from '@/libs/hooks/use-ruleset-diff';

export const DIFF_TYPE_LABEL: Record<DiffItem['type'], string> = {
  added: 'Added',
  removed: 'Removed',
  changed: 'Changed',
};

export const LABEL_ICON: Partial<Record<string, string>> = {
  'added-Category': '/trading-hub/asset/icon-plus-simple.svg',
  'removed-Category': '/trading-hub/asset/icon-minus.svg',
  'added-Keyword': '/trading-hub/asset/icon-plus-simple.svg',
  'removed-Keyword': '/trading-hub/asset/icon-minus.svg',
  'Pinned product': '/trading-hub/asset/icon-pin.svg',
  'Blocked product': '/trading-hub/asset/icon-blocked.svg',
  'Boosted product': '/trading-hub/asset/icon-boost.svg',
  'Buried product': '/trading-hub/asset/icon-bury.svg',
  'Numeric boost': '/trading-hub/asset/icon-boost.svg',
  'Alphanumeric boost': '/trading-hub/asset/icon-boost.svg',
  'Numeric bury': '/trading-hub/asset/icon-bury.svg',
  'Alphanumeric bury': '/trading-hub/asset/icon-bury.svg',
  'Include attribute': '/trading-hub/asset/icon-include.svg',
  'Exclude attribute': '/trading-hub/asset/icon-exclude.svg',
  'Start date': '/trading-hub/asset/icon-calendar.svg',
  'End date': '/trading-hub/asset/icon-calendar.svg',
  Included: '/trading-hub/asset/icon-include.svg',
  Excluded: '/trading-hub/asset/icon-exclude.svg',
  'Algo control': '/trading-hub/asset/icon-attribute.svg',
  'Facet order': '/trading-hub/asset/icon-arrow-up.svg',
};
