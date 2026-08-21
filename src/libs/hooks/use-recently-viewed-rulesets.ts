import {
  isValidRulesetType,
  type RulesetTypeString,
} from '@/libs/utils/ruleset-type';

import {
  isRecord,
  readLocalStorage,
  writeLocalStorage,
} from './utils/local-storage';

const STORAGE_KEY = 'recently-viewed-rulesets';
export const MAX_RECENTLY_VIEWED = 10;

export type RulesetType = RulesetTypeString;

export type RecentlyViewedRuleset = {
  id: string;
  label: string;
  url: string;
  type: RulesetType;
  viewedAt: number;
};

const isRecentlyViewedRuleset = (
  item: unknown
): item is RecentlyViewedRuleset => {
  if (!isRecord(item)) return false;

  const { id, label, url, type, viewedAt } = item;

  return (
    typeof id === 'string' &&
    typeof label === 'string' &&
    typeof url === 'string' &&
    isValidRulesetType(type) &&
    typeof viewedAt === 'number'
  );
};

export const getStoredRecentlyViewed = (): RecentlyViewedRuleset[] =>
  readLocalStorage(STORAGE_KEY, isRecentlyViewedRuleset);

export const saveRecentlyViewed = (item: RecentlyViewedRuleset): void => {
  const existing = getStoredRecentlyViewed().filter((r) => r.id !== item.id);
  const updated = [item, ...existing].slice(0, MAX_RECENTLY_VIEWED);
  writeLocalStorage(STORAGE_KEY, updated);
};
