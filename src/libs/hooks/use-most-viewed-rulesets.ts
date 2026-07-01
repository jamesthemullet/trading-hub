import { isValidRulesetType } from '@/libs/utils/ruleset-type';

import type { RulesetType } from './use-recently-viewed-rulesets';

const STORAGE_KEY = 'ruleset-visit-counts';
export const MOST_VIEWED_DAYS = 30;
export const MAX_MOST_VIEWED = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type RulesetVisitRecord = {
  id: string;
  label: string;
  url: string;
  type: RulesetType;
  visits: number[];
};

export type MostViewedRuleset = {
  id: string;
  label: string;
  url: string;
  type: RulesetType;
  count: number;
};

const cutoff = (days: number): number => Date.now() - days * MS_PER_DAY;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRulesetVisitRecord = (item: unknown): item is RulesetVisitRecord => {
  if (!isRecord(item)) return false;

  const { id, label, url, type, visits } = item;

  return (
    typeof id === 'string' &&
    typeof label === 'string' &&
    typeof url === 'string' &&
    isValidRulesetType(type) &&
    Array.isArray(visits) &&
    visits.every((visit) => typeof visit === 'number')
  );
};

const getStoredVisitRecords = (): RulesetVisitRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isRulesetVisitRecord);
  } catch {
    return [];
  }
};

export const saveRulesetVisit = ({
  id,
  label,
  url,
  type,
}: {
  id: string;
  label: string;
  url: string;
  type: RulesetType;
}): void => {
  try {
    const records = getStoredVisitRecords();
    const existing = records.find((r) => r.id === id);
    const now = Date.now();
    const threshold = cutoff(MOST_VIEWED_DAYS);

    const updatedRecords = existing
      ? records.map((r) =>
          r.id === id
            ? {
                ...r,
                label,
                url,
                visits: [...r.visits.filter((t) => t > threshold), now],
              }
            : r
        )
      : [...records, { id, label, url, type, visits: [now] }];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch {
    /* ignore storage errors (private browsing, quota exceeded) */
  }
};

export const getMostViewedRulesets = (
  days = MOST_VIEWED_DAYS,
  limit = MAX_MOST_VIEWED
): MostViewedRuleset[] => {
  const threshold = cutoff(days);
  return getStoredVisitRecords()
    .map(({ id, label, url, type, visits }) => ({
      id,
      label,
      url,
      type,
      count: visits.filter((t) => t > threshold).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};
