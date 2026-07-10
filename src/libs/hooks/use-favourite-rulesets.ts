import { isValidRulesetType } from '@/libs/utils/ruleset-type';

import type { RulesetType } from './use-recently-viewed-rulesets';
import {
  isRecord,
  readLocalStorage,
  writeLocalStorage,
} from './utils/local-storage';

const STORAGE_KEY = 'favourite-rulesets';

export type FavouriteRuleset = {
  id: string;
  label: string;
  url: string;
  type: RulesetType;
};

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

export const getStoredFavourites = (): FavouriteRuleset[] =>
  readLocalStorage(STORAGE_KEY, isFavouriteRuleset);

export const addFavourite = (item: FavouriteRuleset): boolean => {
  const existing = getStoredFavourites().filter((r) => r.id !== item.id);
  return writeLocalStorage(STORAGE_KEY, [...existing, item]);
};

export const removeFavourite = (id: string): boolean => {
  const updated = getStoredFavourites().filter((r) => r.id !== id);
  return writeLocalStorage(STORAGE_KEY, updated);
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
