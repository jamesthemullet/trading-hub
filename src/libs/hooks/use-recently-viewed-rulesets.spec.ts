import type { RecentlyViewedRuleset } from './use-recently-viewed-rulesets';
import {
  getStoredRecentlyViewed,
  MAX_RECENTLY_VIEWED,
  saveRecentlyViewed,
} from './use-recently-viewed-rulesets';

const makeItem = (
  overrides: Partial<RecentlyViewedRuleset> = {}
): RecentlyViewedRuleset => ({
  id: 'abc-123',
  label: 'test | category',
  url: '/category/rulesets/edit/abc-123',
  type: 'category',
  viewedAt: 1000,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
});

describe('getStoredRecentlyViewed', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getStoredRecentlyViewed()).toEqual([]);
  });

  it('returns parsed items from localStorage', () => {
    const item = makeItem();
    localStorage.setItem('recently-viewed-rulesets', JSON.stringify([item]));
    expect(getStoredRecentlyViewed()).toEqual([item]);
  });

  it('returns an empty array when stored value is invalid JSON', () => {
    localStorage.setItem('recently-viewed-rulesets', 'not-json');
    expect(getStoredRecentlyViewed()).toEqual([]);
  });

  it('returns an empty array when stored value is valid JSON but not an array', () => {
    localStorage.setItem(
      'recently-viewed-rulesets',
      JSON.stringify({ id: 'abc-123', viewedAt: 1000 })
    );
    expect(getStoredRecentlyViewed()).toEqual([]);
  });

  it('skips non-object entries in stored arrays', () => {
    localStorage.setItem('recently-viewed-rulesets', JSON.stringify([false]));
    expect(getStoredRecentlyViewed()).toEqual([]);
  });
});

describe('saveRecentlyViewed', () => {
  it('stores a new item at the front of the list', () => {
    const a = makeItem({ id: 'a', viewedAt: 1000 });
    const b = makeItem({ id: 'b', viewedAt: 2000 });
    saveRecentlyViewed(a);
    saveRecentlyViewed(b);
    expect(getStoredRecentlyViewed()[0].id).toBe('b');
  });

  it('deduplicates by id, moving existing item to the front', () => {
    const a = makeItem({ id: 'a' });
    saveRecentlyViewed(a);
    saveRecentlyViewed(makeItem({ id: 'b' }));
    saveRecentlyViewed({ ...a, viewedAt: 9999 });
    const stored = getStoredRecentlyViewed();
    expect(stored[0].id).toBe('a');
    expect(stored.filter((i) => i.id === 'a')).toHaveLength(1);
  });

  it(`caps the list at ${MAX_RECENTLY_VIEWED} items`, () => {
    for (let i = 0; i < MAX_RECENTLY_VIEWED + 5; i++) {
      saveRecentlyViewed(makeItem({ id: `item-${i}` }));
    }
    expect(getStoredRecentlyViewed()).toHaveLength(MAX_RECENTLY_VIEWED);
  });

  it('does not throw when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => saveRecentlyViewed(makeItem())).not.toThrow();
  });
});
