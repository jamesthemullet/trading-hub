import {
  getMostViewedRulesets,
  MAX_MOST_VIEWED,
  MOST_VIEWED_DAYS,
  saveRulesetVisit,
} from './use-most-viewed-rulesets';

const item = {
  id: 'abc',
  label: 'Cat A | Cat B',
  url: '/category/rulesets/edit/abc',
  type: 'category' as const,
};

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('getMostViewedRulesets', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getMostViewedRulesets()).toEqual([]);
  });

  it('returns items sorted by view count descending', () => {
    jest.setSystemTime(new Date('2024-01-15'));
    saveRulesetVisit({ ...item, id: 'a' });
    saveRulesetVisit({ ...item, id: 'b' });
    saveRulesetVisit({ ...item, id: 'b' });
    saveRulesetVisit({ ...item, id: 'c' });
    saveRulesetVisit({ ...item, id: 'c' });
    saveRulesetVisit({ ...item, id: 'c' });

    const result = getMostViewedRulesets();
    expect(result.map((r) => r.id)).toEqual(['c', 'b', 'a']);
    expect(result[0].count).toBe(3);
  });

  it('excludes visits older than the requested days window', () => {
    jest.setSystemTime(new Date('2024-01-01'));
    saveRulesetVisit(item);

    jest.setSystemTime(new Date('2024-02-15')); // 45 days later
    expect(getMostViewedRulesets(MOST_VIEWED_DAYS)).toEqual([]);
  });

  it('includes visits within the days window', () => {
    jest.setSystemTime(new Date('2024-01-01'));
    saveRulesetVisit(item);

    jest.setSystemTime(new Date('2024-01-20')); // 19 days later
    const result = getMostViewedRulesets(MOST_VIEWED_DAYS);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(1);
  });

  it(`caps results at ${MAX_MOST_VIEWED}`, () => {
    jest.setSystemTime(new Date('2024-01-15'));
    for (let i = 0; i < MAX_MOST_VIEWED + 5; i++) {
      saveRulesetVisit({ ...item, id: `item-${i}` });
    }
    expect(getMostViewedRulesets()).toHaveLength(MAX_MOST_VIEWED);
  });
});

describe('saveRulesetVisit', () => {
  it('records each visit as a separate timestamp', () => {
    jest.setSystemTime(new Date('2024-01-15'));
    saveRulesetVisit(item);
    saveRulesetVisit(item);
    saveRulesetVisit(item);

    expect(getMostViewedRulesets()[0].count).toBe(3);
  });

  it('updates label and url when the item changes', () => {
    jest.setSystemTime(new Date('2024-01-15'));
    saveRulesetVisit(item);
    saveRulesetVisit({ ...item, label: 'Updated Label', url: '/new/url' });

    const result = getMostViewedRulesets();
    expect(result[0].label).toBe('Updated Label');
    expect(result[0].url).toBe('/new/url');
  });

  it('prunes visits older than 30 days when saving', () => {
    jest.setSystemTime(new Date('2024-01-01'));
    saveRulesetVisit(item);

    jest.setSystemTime(new Date('2024-02-15')); // 45 days later
    saveRulesetVisit(item); // triggers prune of old visit

    expect(getMostViewedRulesets(MOST_VIEWED_DAYS)[0].count).toBe(1);
  });

  it('does not throw when localStorage.setItem throws', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota exceeded');
      });
    expect(() => saveRulesetVisit(item)).not.toThrow();
    spy.mockRestore();
  });

  it('returns empty array when stored value is invalid JSON', () => {
    localStorage.setItem('ruleset-visit-counts', 'not-json');
    jest.setSystemTime(new Date('2024-01-15'));
    expect(getMostViewedRulesets()).toEqual([]);
  });

  it('returns empty array when stored value is valid JSON but not an array', () => {
    localStorage.setItem(
      'ruleset-visit-counts',
      JSON.stringify({ id: 'abc', visits: [] })
    );
    jest.setSystemTime(new Date('2024-01-15'));
    expect(getMostViewedRulesets()).toEqual([]);
  });

  it('skips non-object entries in stored arrays', () => {
    localStorage.setItem('ruleset-visit-counts', JSON.stringify([false]));
    jest.setSystemTime(new Date('2024-01-15'));
    expect(getMostViewedRulesets()).toEqual([]);
  });
});
