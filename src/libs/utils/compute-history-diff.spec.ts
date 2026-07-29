import { computeHistoryDiff } from './compute-history-diff';

const emptyRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { product: [], numeric: [], alphanumeric: [] },
  buries: { product: [], numeric: [], alphanumeric: [] },
  includes: { alphanumeric: [] },
  excludes: { alphanumeric: [] },
};

const baseSnapshot = {
  rules: emptyRules,
  isEnabled: true,
  startDate: null,
  endDate: null,
  countryCode: 'GB',
};

describe('computeHistoryDiff', () => {
  it('returns creation summary when previous is null', () => {
    expect(computeHistoryDiff(baseSnapshot, null)).toContain('Ruleset created');
  });

  it('includes individual rules in creation summary', () => {
    const snapshot = {
      ...baseSnapshot,
      rules: { ...emptyRules, pinnedProducts: [{ id: 'p1' }, { id: 'p2' }] },
    };
    const result = computeHistoryDiff(snapshot, null);
    expect(result).toContain('Ruleset created');
    expect(result).toContain('p1 pinned');
    expect(result).toContain('p2 pinned');
  });

  it('includes individual search terms in creation summary', () => {
    const snapshot = { ...baseSnapshot, searchTerms: ['jeans', 'denim'] };
    const result = computeHistoryDiff(snapshot, null);
    expect(result).toContain("'jeans' search term added");
    expect(result).toContain("'denim' search term added");
  });

  it('includes individual facets in creation summary', () => {
    const snapshot = {
      ...baseSnapshot,
      facets: [{ id: 'colour', boosted: [], excludedValues: [] }],
    };
    const result = computeHistoryDiff(snapshot, null, { colour: 'Colour' });
    expect(result).toContain("'Colour' facet set to included");
  });

  it('shows only Ruleset created when snapshot has no content', () => {
    expect(computeHistoryDiff({}, null)).toEqual(['Ruleset created']);
  });

  it('returns empty array when snapshots are identical', () => {
    expect(computeHistoryDiff(baseSnapshot, baseSnapshot)).toEqual([]);
  });

  describe('pinned products', () => {
    it('labels a newly pinned product', () => {
      const current = {
        ...baseSnapshot,
        rules: { ...emptyRules, pinnedProducts: [{ id: '12345678' }] },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        '12345678 pinned'
      );
    });

    it('labels a removed pin', () => {
      const previous = {
        ...baseSnapshot,
        rules: { ...emptyRules, pinnedProducts: [{ id: '12345678' }] },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        '12345678 unpinned'
      );
    });

    it('includes the product name on a new line when title/brand are present on the rule', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          pinnedProducts: [{ id: '12345678', brand: 'M&S', title: 'Jeans' }],
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        '12345678 pinned\nM&S Jeans'
      );
    });

    it('falls back to just the id when no title/brand are provided', () => {
      const current = {
        ...baseSnapshot,
        rules: { ...emptyRules, pinnedProducts: [{ id: '12345678' }] },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        '12345678 pinned'
      );
    });
  });

  describe('blocked products', () => {
    it('labels a newly blocked product', () => {
      const current = {
        ...baseSnapshot,
        rules: { ...emptyRules, blockedProducts: [{ id: '99887766' }] },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        '99887766 blocked'
      );
    });

    it('labels a removed block', () => {
      const previous = {
        ...baseSnapshot,
        rules: { ...emptyRules, blockedProducts: [{ id: '99887766' }] },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        '99887766 unblocked'
      );
    });
  });

  describe('product boosts', () => {
    it('labels a newly boosted product', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            product: [{ id: '11112222', weight: 2 }],
          },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        '11112222 boosted'
      );
    });

    it('labels a removed product boost', () => {
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            product: [{ id: '11112222', weight: 2 }],
          },
        },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        '11112222 boost removed'
      );
    });

    it('labels a product boost weight change', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            product: [{ id: '11112222', weight: 3 }],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            product: [{ id: '11112222', weight: 2 }],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        '11112222 boost weight increased to 3'
      );
    });

    it('falls back to the previous entry name when the current entry has no title/brand', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            product: [{ id: '11112222', weight: 3 }],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            product: [
              {
                id: '11112222',
                weight: 2,
                title: 'Jumper',
                brand: 'Autograph',
              },
            ],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        '11112222 boost weight increased to 3\nAutograph Jumper'
      );
    });
  });

  describe('product buries', () => {
    it('labels a newly buried product', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            product: [{ id: '33334444', weight: -1 }],
          },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        '33334444 buried'
      );
    });

    it('labels a removed product bury', () => {
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            product: [{ id: '33334444', weight: -1 }],
          },
        },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        '33334444 bury removed'
      );
    });

    it('labels a product bury weight change', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            product: [{ id: '33334444', weight: -2 }],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            product: [{ id: '33334444', weight: -1 }],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        '33334444 bury weight reduced to -2'
      );
    });
  });

  describe('numeric attribute boosts', () => {
    it('labels a newly boosted numeric attribute', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            numeric: [{ field: 'price', weight: 1 }],
          },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "'price' attribute boosted"
      );
    });

    it('labels a removed numeric attribute boost', () => {
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            numeric: [{ field: 'price', weight: 1 }],
          },
        },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        "'price' attribute boost removed"
      );
    });

    it('labels a numeric attribute boost weight change', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            numeric: [{ field: 'price', weight: 2 }],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            numeric: [{ field: 'price', weight: 1 }],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        "'price' attribute boost weight increased to 2"
      );
    });
  });

  describe('numeric attribute buries', () => {
    it('labels a newly buried numeric attribute', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            numeric: [{ field: 'stock', weight: -1 }],
          },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "'stock' attribute buried"
      );
    });

    it('labels a removed numeric attribute bury', () => {
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            numeric: [{ field: 'stock', weight: -1 }],
          },
        },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        "'stock' attribute bury removed"
      );
    });

    it('labels a numeric attribute bury weight change', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            numeric: [{ field: 'stock', weight: -2 }],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            numeric: [{ field: 'stock', weight: -1 }],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        "'stock' attribute bury weight reduced to -2"
      );
    });
  });

  describe('alphanumeric attribute boosts', () => {
    const alphanumericBoost = {
      fields: [{ field: 'colour', values: ['red', 'blue'] }],
      weight: 1,
    };

    it('labels a newly boosted alphanumeric attribute', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: { ...emptyRules.boosts, alphanumeric: [alphanumericBoost] },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "'colour: red, blue' attribute boosted"
      );
    });

    it('labels a removed alphanumeric attribute boost', () => {
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: { ...emptyRules.boosts, alphanumeric: [alphanumericBoost] },
        },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        "'colour: red, blue' attribute boost removed"
      );
    });

    it('labels an alphanumeric attribute boost weight change', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            alphanumeric: [{ ...alphanumericBoost, weight: 3 }],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: { ...emptyRules.boosts, alphanumeric: [alphanumericBoost] },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        "'colour: red, blue' attribute boost weight increased to 3"
      );
      expect(computeHistoryDiff(current, previous)).not.toContain(
        "'colour: red, blue' attribute boosted"
      );
      expect(computeHistoryDiff(current, previous)).not.toContain(
        "'colour: red, blue' attribute boost removed"
      );
    });

    it('labels an alphanumeric attribute boost weight change when previous weight is undefined', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            alphanumeric: [alphanumericBoost],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            alphanumeric: [{ ...alphanumericBoost, weight: undefined }],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        "'colour: red, blue' attribute boost weight increased to 1"
      );
    });

    it('labels an alphanumeric attribute boost weight change when current weight is undefined', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: {
            ...emptyRules.boosts,
            alphanumeric: [{ ...alphanumericBoost, weight: undefined }],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: { ...emptyRules.boosts, alphanumeric: [alphanumericBoost] },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        "'colour: red, blue' attribute boost weight reduced to undefined"
      );
    });

    it('combines multiple fields with + separator', () => {
      const multiFieldBoost = {
        fields: [
          { field: 'colour', values: ['red'] },
          { field: 'size', values: ['M'] },
        ],
        weight: 1,
      };
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          boosts: { ...emptyRules.boosts, alphanumeric: [multiFieldBoost] },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "'colour: red + size: M' attribute boosted"
      );
    });
  });

  describe('alphanumeric attribute buries', () => {
    it('labels a newly buried alphanumeric attribute', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            alphanumeric: [
              { fields: [{ field: 'size', values: ['XL'] }], weight: -1 },
            ],
          },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "'size: XL' attribute buried"
      );
    });

    it('labels a removed alphanumeric attribute bury', () => {
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            alphanumeric: [
              { fields: [{ field: 'size', values: ['XL'] }], weight: -1 },
            ],
          },
        },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        "'size: XL' attribute bury removed"
      );
    });

    it('labels an alphanumeric attribute bury weight change', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            alphanumeric: [
              { fields: [{ field: 'size', values: ['XL'] }], weight: -2 },
            ],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            alphanumeric: [
              { fields: [{ field: 'size', values: ['XL'] }], weight: -1 },
            ],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        "'size: XL' attribute bury weight reduced to -2"
      );
      expect(computeHistoryDiff(current, previous)).not.toContain(
        "'size: XL' attribute buried"
      );
      expect(computeHistoryDiff(current, previous)).not.toContain(
        "'size: XL' attribute bury removed"
      );
    });

    it('labels an alphanumeric attribute bury weight change when previous weight is undefined', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            alphanumeric: [
              { fields: [{ field: 'size', values: ['XL'] }], weight: -1 },
            ],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            alphanumeric: [
              {
                fields: [{ field: 'size', values: ['XL'] }],
                weight: undefined,
              },
            ],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        "'size: XL' attribute bury weight reduced to -1"
      );
    });

    it('labels an alphanumeric attribute bury weight change when current weight is undefined', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            alphanumeric: [
              {
                fields: [{ field: 'size', values: ['XL'] }],
                weight: undefined,
              },
            ],
          },
        },
      };
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          buries: {
            ...emptyRules.buries,
            alphanumeric: [
              { fields: [{ field: 'size', values: ['XL'] }], weight: -1 },
            ],
          },
        },
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        "'size: XL' attribute bury weight increased to undefined"
      );
    });
  });

  describe('includes', () => {
    it('labels a newly added include rule', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          includes: {
            alphanumeric: [{ fields: [{ field: 'brand', values: ['Nike'] }] }],
          },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "Include added: 'brand: Nike'"
      );
    });

    it('labels a removed include rule', () => {
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          includes: {
            alphanumeric: [{ fields: [{ field: 'brand', values: ['Nike'] }] }],
          },
        },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        "Include removed: 'brand: Nike'"
      );
    });
  });

  describe('excludes', () => {
    it('labels a newly added exclude rule', () => {
      const current = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          excludes: {
            alphanumeric: [
              { fields: [{ field: 'brand', values: ['Adidas'] }] },
            ],
          },
        },
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "Exclude added: 'brand: Adidas'"
      );
    });

    it('labels a removed exclude rule', () => {
      const previous = {
        ...baseSnapshot,
        rules: {
          ...emptyRules,
          excludes: {
            alphanumeric: [
              { fields: [{ field: 'brand', values: ['Adidas'] }] },
            ],
          },
        },
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        "Exclude removed: 'brand: Adidas'"
      );
    });
  });

  describe('settings', () => {
    it('labels a disable event', () => {
      const current = { ...baseSnapshot, isEnabled: false };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        'Ruleset disabled'
      );
    });

    it('labels an enable event', () => {
      const previous = { ...baseSnapshot, isEnabled: false };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        'Ruleset enabled'
      );
    });

    it('labels a start date being added', () => {
      const current = {
        ...baseSnapshot,
        startDate: '2024-01-01T00:00:00.000Z',
      };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        'Start date added'
      );
    });

    it('labels a start date being removed', () => {
      const previous = {
        ...baseSnapshot,
        startDate: '2024-01-01T00:00:00.000Z',
      };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        'Start date removed'
      );
    });

    it('labels a start date being changed', () => {
      const current = {
        ...baseSnapshot,
        startDate: '2024-06-01T00:00:00.000Z',
      };
      const previous = {
        ...baseSnapshot,
        startDate: '2024-01-01T00:00:00.000Z',
      };
      expect(computeHistoryDiff(current, previous)).toContain(
        'Start date changed'
      );
    });

    it('labels an end date being added', () => {
      const current = { ...baseSnapshot, endDate: '2024-12-31T23:59:59.999Z' };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        'End date added'
      );
    });

    it('labels an end date being removed', () => {
      const previous = { ...baseSnapshot, endDate: '2024-12-31T23:59:59.999Z' };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        'End date removed'
      );
    });

    it('labels an end date being changed', () => {
      const current = { ...baseSnapshot, endDate: '2025-03-01T00:00:00.000Z' };
      const previous = { ...baseSnapshot, endDate: '2024-12-31T23:59:59.999Z' };
      expect(computeHistoryDiff(current, previous)).toContain(
        'End date changed'
      );
    });

    it('does not report a date change when null and undefined are compared', () => {
      const withNull = { ...baseSnapshot, startDate: null };
      const withUndefined = { ...baseSnapshot, startDate: undefined };
      expect(computeHistoryDiff(withNull, withUndefined)).not.toContain(
        'Start date added'
      );
      expect(computeHistoryDiff(withUndefined, withNull)).not.toContain(
        'Start date removed'
      );
    });

    it('labels a country code change', () => {
      const current = { ...baseSnapshot, countryCode: 'IE' };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        'Country: IE'
      );
    });

    it('labels search term additions and removals', () => {
      const current = { ...baseSnapshot, searchTerms: ['jeans', 'denim'] };
      const previous = { ...baseSnapshot, searchTerms: ['jeans', 'trousers'] };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain("'denim' search term added");
      expect(result).toContain("'trousers' search term removed");
    });

    it('labels search term added when none previously existed', () => {
      const current = { ...baseSnapshot, searchTerms: ['jeans'] };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "'jeans' search term added"
      );
    });

    it('labels search term removed when none currently exist', () => {
      const previous = { ...baseSnapshot, searchTerms: ['jeans'] };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        "'jeans' search term removed"
      );
    });

    it('labels facets moving between statuses', () => {
      // size moves from algo control → included; brand moves from included → algo control
      const current = {
        ...baseSnapshot,
        facets: [{ id: 'colour' }, { id: 'size' }],
      };
      const previous = {
        ...baseSnapshot,
        facets: [{ id: 'colour' }, { id: 'brand' }],
      };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain("'size' facet set to included");
      expect(result).toContain("'brand' facet set to algo control");
    });

    it('labels a facet moving from included to excluded', () => {
      const current = {
        ...baseSnapshot,
        excludedFacets: { facets: [{ id: 'price' }] },
      };
      const previous = { ...baseSnapshot, facets: [{ id: 'price' }] };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain("'price' facet set to excluded");
    });

    it('labels a facet moving from excluded to algo control', () => {
      const current = { ...baseSnapshot };
      const previous = {
        ...baseSnapshot,
        excludedFacets: { facets: [{ id: 'colour' }] },
      };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain("'colour' facet set to algo control");
    });

    it('labels boosted values added and removed within a facet', () => {
      const current = {
        ...baseSnapshot,
        facets: [
          {
            id: 'style',
            boosted: ['Full cup bra', 'Plunge bra'],
            excludedValues: [],
          },
        ],
      };
      const previous = {
        ...baseSnapshot,
        facets: [
          { id: 'style', boosted: ['Full cup bra'], excludedValues: [] },
        ],
      };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain(
        "'Plunge bra' value set to included in 'style' facet"
      );
    });

    it('labels boosted value removed from a facet', () => {
      const current = {
        ...baseSnapshot,
        facets: [{ id: 'style', boosted: [], excludedValues: [] }],
      };
      const previous = {
        ...baseSnapshot,
        facets: [
          { id: 'style', boosted: ['Full cup bra'], excludedValues: [] },
        ],
      };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain(
        "'Full cup bra' value set to algo control in 'style' facet"
      );
    });

    it('labels excluded values added and removed within a facet', () => {
      const current = {
        ...baseSnapshot,
        facets: [{ id: 'colour', boosted: [], excludedValues: ['Red'] }],
      };
      const previous = {
        ...baseSnapshot,
        facets: [{ id: 'colour', boosted: [], excludedValues: [] }],
      };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain("'Red' value set to excluded in 'colour' facet");
    });

    it('labels excluded value removed from a facet', () => {
      const current = {
        ...baseSnapshot,
        facets: [{ id: 'colour', boosted: [], excludedValues: [] }],
      };
      const previous = {
        ...baseSnapshot,
        facets: [{ id: 'colour', boosted: [], excludedValues: ['Red'] }],
      };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain(
        "'Red' value set to algo control in 'colour' facet"
      );
    });

    it('labels a value moving directly from included to excluded', () => {
      const current = {
        ...baseSnapshot,
        facets: [{ id: 'style', boosted: [], excludedValues: ['Plunge bra'] }],
      };
      const previous = {
        ...baseSnapshot,
        facets: [{ id: 'style', boosted: ['Plunge bra'], excludedValues: [] }],
      };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain(
        "'Plunge bra' value set to excluded in 'style' facet"
      );
    });
  });

  describe('redirects', () => {
    it('labels keywords added and removed', () => {
      const current = { ...baseSnapshot, keywords: ['jeans', 'denim'] };
      const previous = { ...baseSnapshot, keywords: ['jeans', 'trousers'] };
      const result = computeHistoryDiff(current, previous);
      expect(result).toContain("'denim' keyword added");
      expect(result).toContain("'trousers' keyword removed");
    });

    it('labels keyword added when none previously existed', () => {
      const current = { ...baseSnapshot, keywords: ['jeans'] };
      expect(computeHistoryDiff(current, baseSnapshot)).toContain(
        "'jeans' keyword added"
      );
    });

    it('labels keyword removed when none currently exist', () => {
      const previous = { ...baseSnapshot, keywords: ['jeans'] };
      expect(computeHistoryDiff(baseSnapshot, previous)).toContain(
        "'jeans' keyword removed"
      );
    });

    it('labels destination URL change', () => {
      const current = { ...baseSnapshot, destinationUrl: '/new/path' };
      const previous = { ...baseSnapshot, destinationUrl: '/old/path' };
      expect(computeHistoryDiff(current, previous)).toContain(
        'URL changed to: /new/path'
      );
    });

    it('labels rule title change', () => {
      const current = { ...baseSnapshot, ruleTitle: 'New title' };
      const previous = { ...baseSnapshot, ruleTitle: 'Old title' };
      expect(computeHistoryDiff(current, previous)).toContain(
        'Title: New title'
      );
    });

    it('labels type change', () => {
      const current = { ...baseSnapshot, type: 'redirectPhrase' };
      const previous = { ...baseSnapshot, type: 'redirectTerm' };
      expect(computeHistoryDiff(current, previous)).toContain(
        'Type set to: redirectPhrase'
      );
    });
  });

  it('returns descriptions for multiple simultaneous changes', () => {
    const current = {
      ...baseSnapshot,
      isEnabled: false,
      rules: {
        ...emptyRules,
        pinnedProducts: [{ id: '12345678' }],
        boosts: {
          ...emptyRules.boosts,
          numeric: [{ field: 'price', weight: 1 }],
        },
      },
    };
    const result = computeHistoryDiff(current, baseSnapshot);
    expect(result).toContain('12345678 pinned');
    expect(result).toContain("'price' attribute boosted");
    expect(result).toContain('Ruleset disabled');
  });

  it('handles snapshots with undefined rules gracefully', () => {
    expect(
      computeHistoryDiff({ isEnabled: true }, { isEnabled: true })
    ).toEqual([]);
  });

  it('does not include country change when countryCode is undefined in current', () => {
    const current = { ...baseSnapshot, countryCode: undefined };
    expect(computeHistoryDiff(current, baseSnapshot)).not.toContain(
      'Country: undefined'
    );
  });
});
