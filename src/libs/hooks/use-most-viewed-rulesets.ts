import { isValidRulesetType } from '@/libs/utils/ruleset-type';

import type { RulesetType } from './use-recently-viewed-rulesets';
import {
  isRecord,
  readLocalStorage,
  writeLocalStorage,
} from './utils/local-storage';

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

const getStoredVisitRecords = (): RulesetVisitRecord[] =>
  readLocalStorage(STORAGE_KEY, isRulesetVisitRecord);

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
  const records = getStoredVisitRecords();
  const existing = records.find((record) => record.id === id);
  const now = Date.now();
  const threshold = cutoff(MOST_VIEWED_DAYS);

  const updatedRecords = existing
    ? records.map((record) =>
        record.id === id
          ? {
              ...record,
              label,
              url,
              visits: [
                ...record.visits.filter((timestamp) => timestamp > threshold),
                now,
              ],
            }
          : record
      )
    : [...records, { id, label, url, type, visits: [now] }];

  writeLocalStorage(STORAGE_KEY, updatedRecords);
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
      count: visits.filter((timestamp) => timestamp > threshold).length,
    }))
    .filter((record) => record.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};
