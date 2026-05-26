const STORAGE_KEY = 'product-status-recent-searches';
export const MAX_RECENT_SEARCHES = 20;

export type RecentSearch = {
  displayId: string;
  title: string | null;
  imageUrl: string | null;
  mainStatusLabel: string;
  mainStatusVariant: string;
  searchedAt: number;
};

export const getStoredSearches = (): RecentSearch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentSearch[]) : [];
  } catch {
    return [];
  }
};

export const saveSearches = (searches: RecentSearch[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    /* ignore storage errors (private browsing, quota exceeded) */
  }
};
