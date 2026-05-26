import type { RecentSearch } from './recent-searches-storage';
import {
  getStoredSearches,
  MAX_RECENT_SEARCHES,
  saveSearches,
} from './recent-searches-storage';

const makeSearch = (displayId: string): RecentSearch => ({
  displayId,
  title: `Product ${displayId}`,
  imageUrl: null,
  mainStatusLabel: 'Product is operational',
  mainStatusVariant: 'product-operational',
  searchedAt: 1000,
});

beforeEach(() => {
  localStorage.clear();
});

describe('getStoredSearches', () => {
  it('returns empty array when nothing is stored', () => {
    expect(getStoredSearches()).toEqual([]);
  });

  it('returns parsed array from localStorage', () => {
    const searches = [makeSearch('P60538523')];
    localStorage.setItem(
      'product-status-recent-searches',
      JSON.stringify(searches)
    );
    expect(getStoredSearches()).toEqual(searches);
  });

  it('returns empty array when stored value is invalid JSON', () => {
    localStorage.setItem('product-status-recent-searches', 'not-json');
    expect(getStoredSearches()).toEqual([]);
  });
});

describe('saveSearches', () => {
  it('persists searches to localStorage', () => {
    const searches = [makeSearch('P60538523'), makeSearch('P99999999')];
    saveSearches(searches);
    expect(
      JSON.parse(localStorage.getItem('product-status-recent-searches')!)
    ).toEqual(searches);
  });

  it('does not throw when localStorage.setItem throws', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
    expect(() => saveSearches([makeSearch('P60538523')])).not.toThrow();
    spy.mockRestore();
  });
});

describe('MAX_RECENT_SEARCHES', () => {
  it('is 20', () => {
    expect(MAX_RECENT_SEARCHES).toBe(20);
  });
});
