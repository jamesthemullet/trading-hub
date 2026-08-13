import type { DiffItem } from '@/libs/hooks/use-ruleset-diff';

export const DIFF_TYPE_LABEL: Record<DiffItem['type'], string> = {
  added: 'Added',
  removed: 'Removed',
  changed: 'Changed',
};

// Labels that already contain their own verb (e.g. "Amended") and should
// not be prefixed with a DIFF_TYPE_LABEL, to avoid headings like
// "Removed Amended merge group".
const UNPREFIXED_LABELS = new Set(['Amended merge group']);

export const getDiffItemHeading = (item: DiffItem): string =>
  UNPREFIXED_LABELS.has(item.label)
    ? item.label
    : `${DIFF_TYPE_LABEL[item.type]} ${item.label}`;

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
  'Include only': '/trading-hub/asset/icon-include.svg',
  'Exclude only': '/trading-hub/asset/icon-exclude.svg',
  'Changed value': '/trading-hub/asset/icon-edit.svg',
  'Value order up': '/trading-hub/asset/icon-arrow-up.svg',
  'Value order down': '/trading-hub/asset/icon-arrow-up.svg',
  'Facet order up': '/trading-hub/asset/icon-arrow-up.svg',
  'Facet order down': '/trading-hub/asset/icon-arrow-up.svg',
  'added-Merged group': '/trading-hub/asset/icon-merge.svg',
  'removed-Merged group': '/trading-hub/asset/icon-merge.svg',
  'Amended merge group': '/trading-hub/asset/icon-merge.svg',
};
