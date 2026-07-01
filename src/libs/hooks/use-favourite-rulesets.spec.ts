import type { FavouriteRuleset } from './use-favourite-rulesets';
import {
  addFavourite,
  getStoredFavourites,
  isFavourite,
  removeFavourite,
  toggleFavourite,
} from './use-favourite-rulesets';

const makeItem = (
  overrides: Partial<FavouriteRuleset> = {}
): FavouriteRuleset => ({
  id: 'abc-123',
  label: 'Jeans | category',
  url: '/category/rulesets/edit/abc-123',
  type: 'category',
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getStoredFavourites', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getStoredFavourites()).toEqual([]);
  });

  it('returns parsed items from localStorage', () => {
    const item = makeItem();
    localStorage.setItem('favourite-rulesets', JSON.stringify([item]));
    expect(getStoredFavourites()).toEqual([item]);
  });

  it('returns an empty array when stored value is invalid JSON', () => {
    localStorage.setItem('favourite-rulesets', 'not-json');
    expect(getStoredFavourites()).toEqual([]);
  });

  it('returns an empty array when stored value is valid JSON but not an array', () => {
    localStorage.setItem(
      'favourite-rulesets',
      JSON.stringify({ id: 'abc-123' })
    );
    expect(getStoredFavourites()).toEqual([]);
  });

  it('skips non-object entries in stored arrays', () => {
    localStorage.setItem('favourite-rulesets', JSON.stringify([false, null]));
    expect(getStoredFavourites()).toEqual([]);
  });

  it('skips items with an invalid type', () => {
    localStorage.setItem(
      'favourite-rulesets',
      JSON.stringify([{ id: 'x', label: 'x', url: '/x', type: 'unknown-type' }])
    );
    expect(getStoredFavourites()).toEqual([]);
  });
});

describe('addFavourite', () => {
  it('adds a new item', () => {
    const item = makeItem();
    expect(addFavourite(item)).toBe(true);
    expect(getStoredFavourites()).toEqual([item]);
  });

  it('deduplicates by id (replaces existing entry)', () => {
    const item = makeItem();
    addFavourite(item);
    expect(addFavourite({ ...item, label: 'Updated label' })).toBe(true);
    const stored = getStoredFavourites();
    expect(stored).toHaveLength(1);
    expect(stored[0].label).toBe('Updated label');
  });

  it('does not throw when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => addFavourite(makeItem())).not.toThrow();
    expect(addFavourite(makeItem())).toBe(false);
  });
});

describe('removeFavourite', () => {
  it('removes an item by id', () => {
    const a = makeItem({ id: 'a' });
    const b = makeItem({ id: 'b' });
    addFavourite(a);
    addFavourite(b);
    expect(removeFavourite('a')).toBe(true);
    expect(getStoredFavourites().map((r) => r.id)).toEqual(['b']);
  });

  it('is a no-op when the id does not exist', () => {
    const item = makeItem();
    addFavourite(item);
    expect(removeFavourite('does-not-exist')).toBe(true);
    expect(getStoredFavourites()).toHaveLength(1);
  });

  it('does not throw when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => removeFavourite('any-id')).not.toThrow();
    expect(removeFavourite('any-id')).toBe(false);
  });
});

describe('toggleFavourite', () => {
  it('adds an item when it is not yet a favourite', () => {
    const item = makeItem();
    expect(toggleFavourite(item)).toBe(true);
    expect(getStoredFavourites()).toHaveLength(1);
  });

  it('removes an item when it is already a favourite', () => {
    const item = makeItem();
    addFavourite(item);
    expect(toggleFavourite(item)).toBe(true);
    expect(getStoredFavourites()).toHaveLength(0);
  });

  it('returns false when persisting favourites fails', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(toggleFavourite(makeItem())).toBe(false);
  });
});

describe('isFavourite', () => {
  it('returns false when the id is not stored', () => {
    expect(isFavourite('abc-123')).toBe(false);
  });

  it('returns true when the id is stored', () => {
    addFavourite(makeItem({ id: 'abc-123' }));
    expect(isFavourite('abc-123')).toBe(true);
  });

  it('returns false for a different id', () => {
    addFavourite(makeItem({ id: 'abc-123' }));
    expect(isFavourite('xyz-999')).toBe(false);
  });
});
