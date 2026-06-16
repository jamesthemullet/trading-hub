const STORAGE_KEY = 'user-rows-per-page';
export const PAGE_SIZES = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

const isPageSize = (value: number): value is PageSize =>
  value === 10 || value === 20 || value === 50 || value === 100;

export const getStoredRowsPerPage = (): PageSize => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    return isPageSize(parsed) ? parsed : DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
};

export const saveRowsPerPage = (size: PageSize): void => {
  try {
    localStorage.setItem(STORAGE_KEY, String(size));
  } catch {
    /* ignore storage errors (private browsing, quota exceeded) */
  }
};
