import { isValidRulesetType } from '@/libs/utils/ruleset-type';

import type { RulesetType } from './use-recently-viewed-rulesets';

const STORAGE_KEY = 'favourite-rulesets';

export type FavouriteRuleset = {
  id: string;
  label: string;
  url: string;
  type: RulesetType;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isFavouriteRuleset = (item: unknown): item is FavouriteRuleset => {
  if (!isRecord(item)) return false;

  const { id, label, url, type } = item;

  return (
    typeof id === 'string' &&
    typeof label === 'string' &&
    typeof url === 'string' &&
    isValidRulesetType(type)
  );
};

export const getStoredFavourites = (): FavouriteRuleset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isFavouriteRuleset);
  } catch {
    return [];
  }
};

export const addFavourite = (item: FavouriteRuleset): boolean => {
  try {
    const existing = getStoredFavourites().filter((r) => r.id !== item.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, item]));
    return true;
  } catch {
    return false;
  }
};

export const removeFavourite = (id: string): boolean => {
  try {
    const updated = getStoredFavourites().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
};

export const toggleFavourite = (item: FavouriteRuleset): boolean => {
  const existing = getStoredFavourites().find((r) => r.id === item.id);
  if (existing) {
    return removeFavourite(item.id);
  } else {
    return addFavourite(item);
  }
};

export const isFavourite = (id: string): boolean =>
  getStoredFavourites().some((r) => r.id === id);
