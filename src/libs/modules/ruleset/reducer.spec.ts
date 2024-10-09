import {
  AlphanumericBoostBury,
  IncludeExclude,
  MerchandisingRules,
  NumericBoostBury,
} from '@/libs/api';

import { rulesetReducer } from './reducer';

describe('Ruleset reducer', () => {
  const defaultState: MerchandisingRules = {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
    buries: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  };

  const mockProductId: string = '123';
  const mockNumericAttribute: NumericBoostBury = {
    field: 'foo',
    weight: 100,
  };
  const mockAlphaNumericAttribute: AlphanumericBoostBury = {
    fields: [{ field: 'foo', values: ['bar'] }],
    weight: 100,
  };
  const mockAlphaNumericIncludeExcludeAttribute: IncludeExclude = {
    fields: [{ field: 'foo', values: ['bar'] }],
  };

  describe('products', () => {
    it('should pin a product', () => {
      const reducerState = rulesetReducer(defaultState, {
        type: 'product',
        payload: {
          operation: 'pin',
          change: 'add',
          id: mockProductId,
          position: 1,
        },
      });

      expect(reducerState.pinnedProducts[0]).toEqual({ id: mockProductId });
    });

    it('should unpin a product', () => {
      const reducerState = rulesetReducer(
        { ...defaultState, pinnedProducts: [{ id: mockProductId }] },
        {
          type: 'product',
          payload: {
            operation: 'pin',
            change: 'remove',
            id: mockProductId,
            position: 1,
          },
        }
      );

      expect(reducerState.pinnedProducts.length).toEqual(0);
    });

    it('should remove a product from boosts if pinning the same product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          boosts: {
            ...defaultState.boosts,
            product: [{ id: mockProductId, weight: 100 }],
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'pin',
            change: 'add',
            id: mockProductId,
            position: 1,
          },
        }
      );

      expect(reducerState.pinnedProducts[0]).toEqual({ id: mockProductId });
      expect(reducerState.boosts.product.length).toBe(0);
    });

    it('should remove a product from buries if pinning the same product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          buries: {
            ...defaultState.buries,
            product: [{ id: mockProductId, weight: 100 }],
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'pin',
            change: 'add',
            id: mockProductId,
            position: 1,
          },
        }
      );

      expect(reducerState.pinnedProducts[0]).toEqual({ id: mockProductId });
      expect(reducerState.buries.product.length).toBe(0);
    });

    it('should remove a product from block products if pinning the same product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          blockedProducts: [{ id: mockProductId }],
        },
        {
          type: 'product',
          payload: {
            operation: 'pin',
            change: 'add',
            id: mockProductId,
            position: 1,
          },
        }
      );

      expect(reducerState.pinnedProducts[0]).toEqual({ id: mockProductId });
      expect(reducerState.blockedProducts.length).toBe(0);
    });

    it('should block a product', () => {
      const reducerState = rulesetReducer(defaultState, {
        type: 'product',
        payload: { operation: 'block', change: 'add', id: mockProductId },
      });

      expect(reducerState.blockedProducts[0]).toEqual({
        id: mockProductId,
        weight: 100,
      });
    });

    it('should unblock a product', () => {
      const reducerState = rulesetReducer(
        { ...defaultState, blockedProducts: [{ id: mockProductId }] },
        {
          type: 'product',
          payload: { operation: 'block', change: 'remove', id: mockProductId },
        }
      );

      expect(reducerState.blockedProducts.length).toEqual(0);
    });

    it('should remove a product from pinned products if blocking the same product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          pinnedProducts: [{ id: mockProductId }],
        },
        {
          type: 'product',
          payload: {
            operation: 'block',
            change: 'add',
            id: mockProductId,
            position: 1,
          },
        }
      );

      expect(reducerState.blockedProducts[0]).toEqual({
        id: mockProductId,
        weight: 100,
      });
      expect(reducerState.pinnedProducts.length).toBe(0);
    });

    it('should boost a product', () => {
      const reducerState = rulesetReducer(defaultState, {
        type: 'product',
        payload: { operation: 'boost', change: 'add', id: mockProductId },
      });

      expect(reducerState.boosts.product[0]).toEqual({
        id: mockProductId,
        weight: 100,
      });
    });

    it('should unboost a product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          boosts: {
            product: [{ id: mockProductId, weight: 100 }],
            alphanumeric: [],
            numeric: [],
          },
        },
        {
          type: 'product',
          payload: { operation: 'boost', change: 'remove', id: mockProductId },
        }
      );

      expect(reducerState.boosts.product.length).toEqual(0);
    });

    it('should bury a product', () => {
      const reducerState = rulesetReducer(defaultState, {
        type: 'product',
        payload: { operation: 'bury', change: 'add', id: mockProductId },
      });

      expect(reducerState.buries.product[0]).toEqual({
        id: mockProductId,
        weight: 100,
      });
    });

    it('should unbury a product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          buries: {
            ...defaultState.buries,
            product: [{ id: mockProductId, weight: 100 }],
          },
        },
        {
          type: 'product',
          payload: { operation: 'bury', change: 'remove', id: mockProductId },
        }
      );

      expect(reducerState.buries.product.length).toEqual(0);
    });
  });

  describe('attributes', () => {
    describe('numeric', () => {
      it('should add a numeric attribute', () => {
        const reducerState = rulesetReducer(defaultState, {
          type: 'numericAttribute',
          payload: {
            operation: 'boost',
            change: 'add',
            index: 0,
            data: mockNumericAttribute,
          },
        });

        expect(reducerState.boosts.numeric[0]).toEqual(mockNumericAttribute);
      });

      it('should modify a numeric attribute', () => {
        const reducerUpdatedState = rulesetReducer(
          {
            ...defaultState,
            boosts: {
              ...defaultState.boosts,
              numeric: [mockNumericAttribute, mockNumericAttribute],
            },
          },
          {
            type: 'numericAttribute',
            payload: {
              operation: 'boost',
              change: 'modify',
              index: 0,
              data: { ...mockNumericAttribute, weight: 10 },
            },
          }
        );

        expect(reducerUpdatedState.boosts.numeric[0].weight).toEqual(10);
      });

      it('should remove a numeric attribute', () => {
        const reducerDeletedState = rulesetReducer(
          {
            ...defaultState,
            boosts: { ...defaultState.boosts, numeric: [mockNumericAttribute] },
          },
          {
            type: 'numericAttribute',
            payload: {
              operation: 'boost',
              change: 'remove',
              index: 0,
              data: mockNumericAttribute,
            },
          }
        );

        expect(reducerDeletedState.boosts.numeric.length).toEqual(0);
      });

      it('should bury a numeric attribute', () => {
        const reducerState = rulesetReducer(defaultState, {
          type: 'numericAttribute',
          payload: {
            operation: 'bury',
            change: 'add',
            index: 0,
            data: mockNumericAttribute,
          },
        });

        expect(reducerState.buries.numeric[0]).toEqual(mockNumericAttribute);
      });
    });

    describe('alphanumeric', () => {
      it('should add an alphanumeric attribute', () => {
        const reducerState = rulesetReducer(defaultState, {
          type: 'alphanumericBoostBuryAttribute',
          payload: {
            operation: 'boost',
            change: 'add',
            index: 0,
            data: mockAlphaNumericAttribute,
          },
        });

        expect(reducerState.boosts.alphanumeric[0]).toEqual(
          mockAlphaNumericAttribute
        );
      });

      it('should modify an alphanumeric attribute', () => {
        const reducerUpdatedState = rulesetReducer(
          {
            ...defaultState,
            boosts: {
              ...defaultState.boosts,
              alphanumeric: [
                mockAlphaNumericAttribute,
                mockAlphaNumericAttribute,
              ],
            },
          },
          {
            type: 'alphanumericBoostBuryAttribute',
            payload: {
              operation: 'boost',
              change: 'modify',
              index: 0,
              data: { ...mockAlphaNumericAttribute, weight: 10 },
            },
          }
        );

        expect(reducerUpdatedState.boosts.alphanumeric[0].weight).toEqual(10);
      });

      it('should remove an alphanumeric attribute', () => {
        const reducerDeletedState = rulesetReducer(
          {
            ...defaultState,
            boosts: {
              ...defaultState.boosts,
              alphanumeric: [mockAlphaNumericAttribute],
            },
          },
          {
            type: 'alphanumericBoostBuryAttribute',
            payload: {
              operation: 'boost',
              change: 'remove',
              index: 0,
              data: mockAlphaNumericAttribute,
            },
          }
        );

        expect(reducerDeletedState.boosts.alphanumeric.length).toEqual(0);
      });

      it('should bury an alphanumeric attribute', () => {
        const reducerState = rulesetReducer(defaultState, {
          type: 'alphanumericBoostBuryAttribute',
          payload: {
            operation: 'bury',
            change: 'add',
            index: 0,
            data: mockAlphaNumericAttribute,
          },
        });

        expect(reducerState.buries.alphanumeric[0]).toEqual(
          mockAlphaNumericAttribute
        );
      });

      it('should include an alphanumeric attribute', () => {
        const reducerState = rulesetReducer(defaultState, {
          type: 'alphanumericIncludeExcludeAttribute',
          payload: {
            operation: 'include',
            change: 'add',
            index: 0,
            data: mockAlphaNumericIncludeExcludeAttribute,
          },
        });

        expect(reducerState.includes.alphanumeric?.[0]).toEqual(
          mockAlphaNumericIncludeExcludeAttribute
        );
      });

      it('should exclude an alphanumeric attribute', () => {
        const reducerState = rulesetReducer(defaultState, {
          type: 'alphanumericIncludeExcludeAttribute',
          payload: {
            operation: 'exclude',
            change: 'add',
            index: 0,
            data: mockAlphaNumericIncludeExcludeAttribute,
          },
        });

        expect(reducerState.excludes.alphanumeric?.[0]).toEqual(
          mockAlphaNumericIncludeExcludeAttribute
        );
      });

      it('should include an alphanumeric attribute when not set', () => {
        const reducerState = rulesetReducer(
          { ...defaultState, includes: {} },
          {
            type: 'alphanumericIncludeExcludeAttribute',
            payload: {
              operation: 'include',
              change: 'add',
              index: 0,
              data: mockAlphaNumericIncludeExcludeAttribute,
            },
          }
        );

        expect(reducerState.includes.alphanumeric?.[0]).toEqual(
          mockAlphaNumericIncludeExcludeAttribute
        );
      });

      it('should exclude an alphanumeric attribute when not set', () => {
        const reducerState = rulesetReducer(
          { ...defaultState, excludes: {} },
          {
            type: 'alphanumericIncludeExcludeAttribute',
            payload: {
              operation: 'exclude',
              change: 'add',
              index: 0,
              data: mockAlphaNumericIncludeExcludeAttribute,
            },
          }
        );

        expect(reducerState.excludes.alphanumeric?.[0]).toEqual(
          mockAlphaNumericIncludeExcludeAttribute
        );
      });

      it('should remove an excluded alphanumeric attribute', () => {
        const reducerState = rulesetReducer(
          {
            ...defaultState,
            excludes: { alphanumeric: [mockAlphaNumericAttribute] },
          },
          {
            type: 'alphanumericIncludeExcludeAttribute',
            payload: {
              operation: 'exclude',
              change: 'remove',
              index: 0,
              data: mockAlphaNumericIncludeExcludeAttribute,
            },
          }
        );

        expect(reducerState.excludes.alphanumeric?.length).toBe(0);
      });
    });
  });
});
