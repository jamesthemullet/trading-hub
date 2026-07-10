import type { MerchandisingRuleSet } from '@/libs/api';

import { useRulesetDiff } from './use-ruleset-diff';

const emptyRules: MerchandisingRuleSet = {
  isEnabled: true,
  rules: {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: { alphanumeric: [] },
    excludes: { alphanumeric: [] },
  },
};

describe('useRulesetDiff', () => {
  it('should return an empty diff when original is undefined', () => {
    const result = useRulesetDiff(undefined, emptyRules);
    expect(result).toEqual([]);
  });

  it('should return an empty diff when rulesets are identical', () => {
    const result = useRulesetDiff(emptyRules, emptyRules);
    expect(result).toEqual([]);
  });

  it('should return an empty diff when disabled via options', () => {
    const current: MerchandisingRuleSet = {
      ...emptyRules,
      rules: {
        ...emptyRules.rules,
        pinnedProducts: [{ id: 'prod1' }],
      },
    };

    const result = useRulesetDiff(emptyRules, current, { isEnabled: false });

    expect(result).toEqual([]);
  });

  describe('pinned products', () => {
    it('should detect added pinned product', () => {
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          pinnedProducts: [{ id: 'prod1' }],
        },
      };
      const result = useRulesetDiff(emptyRules, current);
      expect(result).toContainEqual({
        type: 'added',
        label: 'Pinned product',
        description: 'prod1',
      });
    });

    it('should detect removed pinned product', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          pinnedProducts: [{ id: 'prod1' }],
        },
      };
      const result = useRulesetDiff(original, emptyRules);
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Pinned product',
        description: 'prod1',
      });
    });

    it('should not report unchanged pinned products', () => {
      const rulesetWithPin: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          pinnedProducts: [{ id: 'prod1' }],
        },
      };
      const result = useRulesetDiff(rulesetWithPin, rulesetWithPin);
      expect(result).toEqual([]);
    });

    it('should detect a pinned product position change', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          pinnedProducts: [{ id: 'prod1' }, { id: 'prod2' }],
        },
      };
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          pinnedProducts: [{ id: 'prod2' }, { id: 'prod1' }],
        },
      };
      const result = useRulesetDiff(original, current);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Pinned product',
        description: 'prod2 (position: 2 → 1)',
      });
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Pinned product',
        description: 'prod1 (position: 1 → 2)',
      });
    });
  });

  describe('blocked products', () => {
    it('should detect added blocked product', () => {
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          blockedProducts: [{ id: 'prod2' }],
        },
      };
      const result = useRulesetDiff(emptyRules, current);
      expect(result).toContainEqual({
        type: 'added',
        label: 'Blocked product',
        description: 'prod2',
      });
    });

    it('should detect removed blocked product', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          blockedProducts: [{ id: 'prod2' }],
        },
      };
      const result = useRulesetDiff(original, emptyRules);
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Blocked product',
        description: 'prod2',
      });
    });
  });

  describe('boosted products', () => {
    it('should detect added boosted product at default weight', () => {
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            product: [{ id: 'prod3', weight: 100 }],
          },
        },
      };
      const result = useRulesetDiff(emptyRules, current);
      expect(result).toContainEqual({
        type: 'added',
        label: 'Boosted product',
        description: 'prod3',
      });
    });

    it('should detect removed boosted product at default weight', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            product: [{ id: 'prod3', weight: 100 }],
          },
        },
      };
      const result = useRulesetDiff(original, emptyRules);
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Boosted product',
        description: 'prod3',
      });
    });

    it('should show percentage for added boosted product with non-default weight', () => {
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            product: [{ id: 'prod3', weight: 50 }],
          },
        },
      };
      const result = useRulesetDiff(emptyRules, current);
      expect(result).toContainEqual({
        type: 'added',
        label: 'Boosted product',
        description: 'prod3 (50%)',
      });
    });

    it('should show percentage for removed boosted product with non-default weight', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            product: [{ id: 'prod3', weight: 50 }],
          },
        },
      };
      const result = useRulesetDiff(original, emptyRules);
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Boosted product',
        description: 'prod3 (50%)',
      });
    });

    it('should detect changed boost weight for a product', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            product: [{ id: 'prod3', weight: 100 }],
          },
        },
      };
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            product: [{ id: 'prod3', weight: 50 }],
          },
        },
      };
      const result = useRulesetDiff(original, current);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Boosted product',
        description: 'prod3 (100% → 50%)',
      });
    });

    it('should not report unchanged boosted product weight', () => {
      const rulesetWithBoost: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            product: [{ id: 'prod3', weight: 50 }],
          },
        },
      };
      const result = useRulesetDiff(rulesetWithBoost, rulesetWithBoost);
      expect(result).toEqual([]);
    });
  });

  describe('buried products', () => {
    it('should detect added buried product', () => {
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          buries: {
            ...emptyRules.rules.buries,
            product: [{ id: 'prod4', weight: 50 }],
          },
        },
      };
      const result = useRulesetDiff(emptyRules, current);
      expect(result).toContainEqual({
        type: 'added',
        label: 'Buried product',
        description: 'prod4',
      });
    });

    it('should detect removed buried product', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          buries: {
            ...emptyRules.rules.buries,
            product: [{ id: 'prod4', weight: 50 }],
          },
        },
      };
      const result = useRulesetDiff(original, emptyRules);
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Buried product',
        description: 'prod4',
      });
    });
  });

  describe('numeric boost/bury', () => {
    it('should detect added numeric boost', () => {
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            numeric: [{ field: 'price', weight: 100 }],
          },
        },
      };
      const result = useRulesetDiff(emptyRules, current);
      expect(result).toContainEqual({
        type: 'added',
        label: 'Numeric boost',
        description: 'price (weight: 100)',
      });
    });

    it('should detect removed numeric bury', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          buries: {
            ...emptyRules.rules.buries,
            numeric: [{ field: 'stock', weight: 50 }],
          },
        },
      };
      const result = useRulesetDiff(original, emptyRules);
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Numeric bury',
        description: 'stock (weight: 50)',
      });
    });

    it('should not report unchanged numeric attributes', () => {
      const rulesetWithNumeric: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            numeric: [{ field: 'price', weight: 100 }],
          },
        },
      };
      const result = useRulesetDiff(rulesetWithNumeric, rulesetWithNumeric);
      expect(result).toEqual([]);
    });

    it('should detect changed numeric boost weight', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            numeric: [{ field: 'price', weight: 100 }],
          },
        },
      };
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            numeric: [{ field: 'price', weight: 50 }],
          },
        },
      };
      const result = useRulesetDiff(original, current);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Numeric boost',
        description: 'price (weight: 100 → 50)',
      });
    });
  });

  describe('alphanumeric boost/bury', () => {
    it('should detect added alphanumeric boost', () => {
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            alphanumeric: [
              {
                fields: [{ field: 'colour', values: ['red'] }],
                weight: 100,
              },
            ],
          },
        },
      };
      const result = useRulesetDiff(emptyRules, current);
      expect(result).toContainEqual({
        type: 'added',
        label: 'Alphanumeric boost',
        description: 'colour: red (weight: 100)',
      });
    });

    it('should detect removed alphanumeric bury', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          buries: {
            ...emptyRules.rules.buries,
            alphanumeric: [
              {
                fields: [{ field: 'brand', values: ['Nike', 'Adidas'] }],
                weight: 50,
              },
            ],
          },
        },
      };
      const result = useRulesetDiff(original, emptyRules);
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Alphanumeric bury',
        description: 'brand: Nike, Adidas (weight: 50)',
      });
    });

    it('should not report unchanged attributes', () => {
      const attr = {
        fields: [{ field: 'category', values: ['shoes'] }],
        weight: 100,
      };
      const rulesetWithBoost: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            alphanumeric: [attr],
          },
        },
      };
      const result = useRulesetDiff(rulesetWithBoost, rulesetWithBoost);
      expect(result).toEqual([]);
    });

    it('should detect changed alphanumeric boost weight', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            alphanumeric: [
              { fields: [{ field: 'inStock', values: ['true'] }], weight: 100 },
            ],
          },
        },
      };
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          boosts: {
            ...emptyRules.rules.boosts,
            alphanumeric: [
              { fields: [{ field: 'inStock', values: ['true'] }], weight: 50 },
            ],
          },
        },
      };
      const result = useRulesetDiff(original, current);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Alphanumeric boost',
        description: 'inStock: true (weight: 100 → 50)',
      });
    });
  });

  describe('include/exclude attributes', () => {
    it('should detect added include attribute', () => {
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          includes: {
            alphanumeric: [
              { fields: [{ field: 'category', values: ['shoes'] }] },
            ],
          },
        },
      };
      const result = useRulesetDiff(emptyRules, current);
      expect(result).toContainEqual({
        type: 'added',
        label: 'Include attribute',
        description: 'category: shoes',
      });
    });

    it('should detect removed exclude attribute', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          excludes: {
            alphanumeric: [{ fields: [{ field: 'size', values: ['XL'] }] }],
          },
        },
      };
      const result = useRulesetDiff(original, emptyRules);
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Exclude attribute',
        description: 'size: XL',
      });
    });

    it('should handle undefined alphanumeric arrays in includes and excludes', () => {
      const rulesetWithUndefined: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          includes: { alphanumeric: undefined },
          excludes: { alphanumeric: undefined },
        },
      };
      const result = useRulesetDiff(rulesetWithUndefined, rulesetWithUndefined);
      expect(result).toEqual([]);
    });

    it('should not report include/exclude changes when non-empty arrays are unchanged', () => {
      const rulesetWithIncludeExclude: MerchandisingRuleSet = {
        ...emptyRules,
        rules: {
          ...emptyRules.rules,
          includes: {
            alphanumeric: [
              { fields: [{ field: 'category', values: ['shoes'] }] },
            ],
          },
          excludes: {
            alphanumeric: [{ fields: [{ field: 'size', values: ['XL'] }] }],
          },
        },
      };

      const result = useRulesetDiff(
        rulesetWithIncludeExclude,
        rulesetWithIncludeExclude
      );

      expect(result).toEqual([]);
    });
  });

  describe('date changes', () => {
    it('should detect changed start date', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        startDate: '2024-01-01T00:00:00.000Z',
      };
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        startDate: '2024-06-01T00:00:00.000Z',
      };
      const result = useRulesetDiff(original, current);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Start date',
        description: '01/01/2024 00:00 → 01/06/2024 00:00',
      });
    });

    it('should detect changed end date', () => {
      const original: MerchandisingRuleSet = {
        ...emptyRules,
        endDate: '2024-12-31T00:00:00.000Z',
      };
      const current: MerchandisingRuleSet = {
        ...emptyRules,
        endDate: undefined,
      };
      const result = useRulesetDiff(original, current);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'End date',
        description: '31/12/2024 00:00 → none',
      });
    });

    it('should not report date change when dates are unchanged', () => {
      const ruleset: MerchandisingRuleSet = {
        ...emptyRules,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T00:00:00.000Z',
      };
      const result = useRulesetDiff(ruleset, ruleset);
      expect(result).toEqual([]);
    });
  });

  describe('category ids', () => {
    it('should detect an added category', () => {
      const result = useRulesetDiff(emptyRules, emptyRules, {
        originalCategoryIds: ['cat1'],
        currentCategoryIds: ['cat1', 'cat2'],
      });
      expect(result).toContainEqual({
        type: 'added',
        label: 'Category',
        description: 'cat2',
      });
    });

    it('should detect a removed category', () => {
      const result = useRulesetDiff(emptyRules, emptyRules, {
        originalCategoryIds: ['cat1', 'cat2'],
        currentCategoryIds: ['cat1'],
      });
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Category',
        description: 'cat2',
      });
    });

    it('should not report category change when categories are unchanged', () => {
      const result = useRulesetDiff(emptyRules, emptyRules, {
        originalCategoryIds: ['cat1'],
        currentCategoryIds: ['cat1'],
      });
      expect(result).toEqual([]);
    });

    it('should not report category changes when no options are provided', () => {
      const result = useRulesetDiff(emptyRules, emptyRules);
      expect(result).toEqual([]);
    });
  });

  describe('search terms (keywords)', () => {
    it('should detect an added keyword', () => {
      const result = useRulesetDiff(emptyRules, emptyRules, {
        originalSearchTerms: ['boots'],
        currentSearchTerms: ['boots', 'shoes'],
      });
      expect(result).toContainEqual({
        type: 'added',
        label: 'Keyword',
        description: 'shoes',
      });
    });

    it('should not report keyword changes when terms are unchanged', () => {
      const result = useRulesetDiff(emptyRules, emptyRules, {
        originalSearchTerms: ['boots'],
        currentSearchTerms: ['boots'],
      });
      expect(result).toEqual([]);
    });

    it('should not report keyword changes when no options are provided', () => {
      const result = useRulesetDiff(emptyRules, emptyRules);
      expect(result).toEqual([]);
    });
  });
});
