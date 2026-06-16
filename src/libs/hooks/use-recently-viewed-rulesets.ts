const STORAGE_KEY = 'recently-viewed-rulesets';
export const MAX_RECENTLY_VIEWED = 10;

export type RulesetType = 'category' | 'search' | 'global' | 'redirect';

export type RecentlyViewedRuleset = {
  id: string;
  label: string;
  url: string;
  type: RulesetType;
  viewedAt: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRecentlyViewedRuleset = (
  item: unknown
): item is RecentlyViewedRuleset => {
  if (!isRecord(item)) return false;

  const { id, label, url, type, viewedAt } = item;

  return (
    typeof id === 'string' &&
    typeof label === 'string' &&
    typeof url === 'string' &&
    (type === 'category' ||
      type === 'search' ||
      type === 'global' ||
      type === 'redirect') &&
    typeof viewedAt === 'number'
  );
};

export const getStoredRecentlyViewed = (): RecentlyViewedRuleset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isRecentlyViewedRuleset);
  } catch {
    return [];
  }
};

export const saveRecentlyViewed = (item: RecentlyViewedRuleset): void => {
  try {
    const existing = getStoredRecentlyViewed().filter((r) => r.id !== item.id);
    const updated = [item, ...existing].slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore storage errors (private browsing, quota exceeded) */
  }
};
