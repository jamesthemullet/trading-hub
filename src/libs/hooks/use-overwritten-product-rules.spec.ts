import { renderHook } from '@testing-library/react';

import type { MerchandisingRuleSet } from '@/libs/api';

import { useOverwrittenProductRules } from './use-overwritten-product-rules';

const mockRuleset: MerchandisingRuleSet = {
  isEnabled: true,
  rules: {
    pinnedProducts: [],
    boosts: { alphanumeric: [], numeric: [], product: [] },
    buries: { alphanumeric: [], numeric: [], product: [] },
    blockedProducts: [],
    includes: {},
    excludes: {},
  },
};

describe('useOverwrittenProductRules', () => {
  it('should return zero overwritten rules when no products are selected', () => {
    const { result } = renderHook(() =>
      useOverwrittenProductRules(mockRuleset, [])
    );

    expect(result.current).toEqual({
      totalOverwrittenRules: 0,
      areAllSelectedProductsBlocked: false,
      areAllSelectedProductsBoosted: false,
      areAllSelectedProductsBuried: false,
    });
  });

  it('should return zero overwritten rules when no products overlap', () => {
    const { result } = renderHook(() =>
      useOverwrittenProductRules(mockRuleset, ['abc123'])
    );

    expect(result.current).toEqual({
      totalOverwrittenRules: 0,
      areAllSelectedProductsBlocked: false,
      areAllSelectedProductsBoosted: false,
      areAllSelectedProductsBuried: false,
    });
  });

  it('should count overwritten rules across pinned, blocked, boosted and buried products', () => {
    const ruleset: MerchandisingRuleSet = {
      ...mockRuleset,
      rules: {
        ...mockRuleset.rules,
        pinnedProducts: [{ id: 'foo' }],
        blockedProducts: [{ id: 'bar' }],
        boosts: {
          ...mockRuleset.rules.boosts,
          product: [{ id: 'baz', weight: 100 }],
        },
        buries: {
          ...mockRuleset.rules.buries,
          product: [{ id: 'quz', weight: 100 }],
        },
      },
    };

    const { result } = renderHook(() =>
      useOverwrittenProductRules(ruleset, ['foo', 'bar', 'baz', 'qux'])
    );

    expect(result.current.totalOverwrittenRules).toBe(3);
  });

  it('should report when all selected products are already blocked', () => {
    const ruleset: MerchandisingRuleSet = {
      ...mockRuleset,
      rules: {
        ...mockRuleset.rules,
        blockedProducts: [{ id: 'foo' }, { id: 'bar' }],
      },
    };

    const { result } = renderHook(() =>
      useOverwrittenProductRules(ruleset, ['foo', 'bar'])
    );

    expect(result.current.areAllSelectedProductsBlocked).toBe(true);
    expect(result.current.areAllSelectedProductsBoosted).toBe(false);
    expect(result.current.areAllSelectedProductsBuried).toBe(false);
  });

  it('should report when all selected products are already boosted', () => {
    const ruleset: MerchandisingRuleSet = {
      ...mockRuleset,
      rules: {
        ...mockRuleset.rules,
        boosts: {
          ...mockRuleset.rules.boosts,
          product: [{ id: 'foo', weight: 100 }],
        },
      },
    };

    const { result } = renderHook(() =>
      useOverwrittenProductRules(ruleset, ['foo'])
    );

    expect(result.current.areAllSelectedProductsBoosted).toBe(true);
  });

  it('should report when all selected products are already buried', () => {
    const ruleset: MerchandisingRuleSet = {
      ...mockRuleset,
      rules: {
        ...mockRuleset.rules,
        buries: {
          ...mockRuleset.rules.buries,
          product: [{ id: 'foo', weight: 100 }],
        },
      },
    };

    const { result } = renderHook(() =>
      useOverwrittenProductRules(ruleset, ['foo'])
    );

    expect(result.current.areAllSelectedProductsBuried).toBe(true);
  });
});
