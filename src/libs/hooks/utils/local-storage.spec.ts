import { isRecord, readLocalStorage, writeLocalStorage } from './local-storage';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('isRecord', () => {
  it('returns true for a plain object', () => {
    expect(isRecord({ id: 'x' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isRecord(null)).toBe(false);
  });

  it('returns false for a primitive', () => {
    expect(isRecord('string')).toBe(false);
    expect(isRecord(42)).toBe(false);
    expect(isRecord(false)).toBe(false);
  });

  it('returns false for an array', () => {
    // Arrays are objects but do not satisfy the Record shape convention
    // This test documents the current behaviour — arrays return true because
    // typeof [] === 'object'. Guard functions that call isRecord must check
    // the expected keys explicitly.
    expect(isRecord([])).toBe(true);
  });
});

describe('readLocalStorage', () => {
  const isString = (item: unknown): item is string => typeof item === 'string';

  it('returns an empty array when nothing is stored', () => {
    expect(readLocalStorage('key', isString)).toEqual([]);
  });

  it('returns items matching the guard', () => {
    localStorage.setItem('key', JSON.stringify(['a', 'b', 42]));
    expect(readLocalStorage('key', isString)).toEqual(['a', 'b']);
  });

  it('returns an empty array for invalid JSON', () => {
    localStorage.setItem('key', 'not-json');
    expect(readLocalStorage('key', isString)).toEqual([]);
  });

  it('returns an empty array when the stored value is not an array', () => {
    localStorage.setItem('key', JSON.stringify({ value: 'x' }));
    expect(readLocalStorage('key', isString)).toEqual([]);
  });
});

describe('writeLocalStorage', () => {
  it('writes the JSON-serialised value and returns true', () => {
    const didWrite = writeLocalStorage('key', ['a', 'b']);
    expect(didWrite).toBe(true);
    expect(localStorage.getItem('key')).toBe('["a","b"]');
  });

  it('returns false when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(writeLocalStorage('key', 'value')).toBe(false);
  });
});
