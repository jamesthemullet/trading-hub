import type {
  AlphanumericBoostBury,
  IncludeExclude,
  NumericBoostBury,
  RuleSet,
} from '@/libs/api';

import { rulesetReducer } from './reducer';

describe('Ruleset reducer', () => {
  const defaultState: RuleSet = {
    isEnabled: true,
    rules: {
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
    },
  };

  const mockProductId: string = '123';
  const mockNumericAttribute: NumericBoostBury = {
    field: 'foo',
    weight: 100,
  };
  const mockAlphaNumericAttribute: AlphanumericBoostBury = {
    fields: [{ field: 'foo', values: ['bar', 'baz'] }],
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
          ids: [mockProductId],
          position: 1,
        },
      });

      expect(reducerState.rules.pinnedProducts[0]).toEqual({
        id: mockProductId,
      });
    });

    it('should unpin a product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          rules: {
            ...defaultState.rules,
            pinnedProducts: [{ id: mockProductId }],
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'pin',
            change: 'remove',
            ids: [mockProductId],
            position: 1,
          },
        }
      );

      expect(reducerState.rules.pinnedProducts.length).toEqual(0);
    });

    it('should remove a product from boosts if pinning the same product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          rules: {
            ...defaultState.rules,

            boosts: {
              ...defaultState.rules.boosts,
              product: [{ id: mockProductId, weight: 100 }],
            },
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'pin',
            change: 'add',
            ids: [mockProductId],
            position: 1,
          },
        }
      );

      expect(reducerState.rules.pinnedProducts[0]).toEqual({
        id: mockProductId,
      });
      expect(reducerState.rules.boosts.product.length).toBe(0);
    });

    it('should remove a product from buries if pinning the same product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          rules: {
            ...defaultState.rules,
            buries: {
              ...defaultState.rules.buries,
              product: [{ id: mockProductId, weight: 100 }],
            },
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'pin',
            change: 'add',
            ids: [mockProductId],
            position: 1,
          },
        }
      );

      expect(reducerState.rules.pinnedProducts[0]).toEqual({
        id: mockProductId,
      });
      expect(reducerState.rules.buries.product.length).toBe(0);
    });

    it('should remove a product from block products if pinning the same product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          rules: {
            ...defaultState.rules,
            blockedProducts: [{ id: mockProductId }],
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'pin',
            change: 'add',
            ids: [mockProductId],
            position: 1,
          },
        }
      );

      expect(reducerState.rules.pinnedProducts[0]).toEqual({
        id: mockProductId,
      });
      expect(reducerState.rules.blockedProducts.length).toBe(0);
    });

    it('should block a product', () => {
      const reducerState = rulesetReducer(defaultState, {
        type: 'product',
        payload: { operation: 'block', change: 'add', ids: [mockProductId] },
      });

      expect(reducerState.rules.blockedProducts[0]).toEqual({
        id: mockProductId,
        weight: 100,
      });
    });

    it('should unblock a product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          rules: {
            ...defaultState.rules,
            blockedProducts: [{ id: mockProductId }],
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'block',
            change: 'remove',
            ids: [mockProductId],
          },
        }
      );

      expect(reducerState.rules.blockedProducts.length).toEqual(0);
    });

    it('should remove a product from pinned products if blocking the same product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          rules: {
            ...defaultState.rules,
            pinnedProducts: [{ id: mockProductId }],
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'block',
            change: 'add',
            ids: [mockProductId],
            position: 1,
          },
        }
      );

      expect(reducerState.rules.blockedProducts[0]).toEqual({
        id: mockProductId,
        weight: 100,
      });
      expect(reducerState.rules.pinnedProducts.length).toBe(0);
    });

    it('should boost a product', () => {
      const reducerState = rulesetReducer(defaultState, {
        type: 'product',
        payload: { operation: 'boost', change: 'add', ids: [mockProductId] },
      });

      expect(reducerState.rules.boosts.product[0]).toEqual({
        id: mockProductId,
        weight: 100,
      });
    });

    it('should unboost a product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          rules: {
            ...defaultState.rules,
            boosts: {
              product: [{ id: mockProductId, weight: 100 }],
              alphanumeric: [],
              numeric: [],
            },
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'boost',
            change: 'remove',
            ids: [mockProductId],
          },
        }
      );

      expect(reducerState.rules.boosts.product.length).toEqual(0);
    });

    it('should bury a product', () => {
      const reducerState = rulesetReducer(defaultState, {
        type: 'product',
        payload: { operation: 'bury', change: 'add', ids: [mockProductId] },
      });

      expect(reducerState.rules.buries.product[0]).toEqual({
        id: mockProductId,
        weight: 100,
      });
    });

    it('should unbury a product', () => {
      const reducerState = rulesetReducer(
        {
          ...defaultState,
          rules: {
            ...defaultState.rules,
            buries: {
              ...defaultState.rules.buries,
              product: [{ id: mockProductId, weight: 100 }],
            },
          },
        },
        {
          type: 'product',
          payload: {
            operation: 'bury',
            change: 'remove',
            ids: [mockProductId],
          },
        }
      );

      expect(reducerState.rules.buries.product.length).toEqual(0);
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

        expect(reducerState.rules.boosts.numeric[0]).toEqual(
          mockNumericAttribute
        );
      });

      it('should modify a numeric attribute', () => {
        const reducerUpdatedState = rulesetReducer(
          {
            ...defaultState,
            rules: {
              ...defaultState.rules,
              boosts: {
                ...defaultState.rules.boosts,
                numeric: [mockNumericAttribute, mockNumericAttribute],
              },
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

        expect(reducerUpdatedState.rules.boosts.numeric[0].weight).toEqual(10);
      });

      it('should remove a numeric attribute', () => {
        const reducerDeletedState = rulesetReducer(
          {
            ...defaultState,
            rules: {
              ...defaultState.rules,
              boosts: {
                ...defaultState.rules.boosts,
                numeric: [mockNumericAttribute],
              },
            },
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

        expect(reducerDeletedState.rules.boosts.numeric.length).toEqual(0);
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

        expect(reducerState.rules.buries.numeric[0]).toEqual(
          mockNumericAttribute
        );
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

        expect(reducerState.rules.boosts.alphanumeric[0]).toEqual(
          mockAlphaNumericAttribute
        );
      });

      it('should modify an alphanumeric attribute', () => {
        const reducerUpdatedState = rulesetReducer(
          {
            ...defaultState,
            rules: {
              ...defaultState.rules,
              boosts: {
                ...defaultState.rules.boosts,
                alphanumeric: [
                  mockAlphaNumericAttribute,
                  mockAlphaNumericAttribute,
                ],
              },
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

        expect(reducerUpdatedState.rules.boosts.alphanumeric[0].weight).toEqual(
          10
        );
      });

      it('should remove an alphanumeric attribute', () => {
        const reducerDeletedState = rulesetReducer(
          {
            ...defaultState,
            rules: {
              ...defaultState.rules,
              boosts: {
                ...defaultState.rules.boosts,
                alphanumeric: [mockAlphaNumericAttribute],
              },
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

        expect(reducerDeletedState.rules.boosts.alphanumeric.length).toEqual(0);
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

        expect(reducerState.rules.buries.alphanumeric[0]).toEqual(
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

        expect(reducerState.rules.includes.alphanumeric?.[0]).toEqual(
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

        expect(reducerState.rules.excludes.alphanumeric?.[0]).toEqual(
          mockAlphaNumericIncludeExcludeAttribute
        );
      });

      it('should include an alphanumeric attribute when not set', () => {
        const reducerState = rulesetReducer(
          { ...defaultState, rules: { ...defaultState.rules, includes: {} } },
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

        expect(reducerState.rules.includes.alphanumeric?.[0]).toEqual(
          mockAlphaNumericIncludeExcludeAttribute
        );
      });

      it('should exclude an alphanumeric attribute when not set', () => {
        const reducerState = rulesetReducer(
          { ...defaultState, rules: { ...defaultState.rules, excludes: {} } },
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

        expect(reducerState.rules.excludes.alphanumeric?.[0]).toEqual(
          mockAlphaNumericIncludeExcludeAttribute
        );
      });

      it('should remove an excluded alphanumeric attribute', () => {
        const reducerState = rulesetReducer(
          {
            ...defaultState,
            rules: {
              ...defaultState.rules,
              excludes: { alphanumeric: [mockAlphaNumericAttribute] },
            },
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

        expect(reducerState.rules.excludes.alphanumeric?.length).toBe(0);
      });

      it('should modify an include as an alphanumeric attribute', () => {
        const reducerState = rulesetReducer(
          {
            ...defaultState,
            rules: {
              ...defaultState.rules,
              includes: {
                alphanumeric: [
                  mockAlphaNumericIncludeExcludeAttribute,
                  mockAlphaNumericIncludeExcludeAttribute,
                ],
              },
            },
          },
          {
            type: 'alphanumericIncludeExcludeAttribute',
            payload: {
              operation: 'include',
              change: 'modify',
              index: 1,
              data: { fields: [{ field: 'foo', values: ['bar, bags'] }] },
            },
          }
        );

        expect(reducerState.rules.includes.alphanumeric?.length).toBe(2);
        expect(
          reducerState.rules.includes.alphanumeric?.[1].fields[0].values
        ).toEqual(['bar, bags']);
      });
    });
  });

  describe('Scheduling', () => {
    const mockStartDate = '2024-10-31T00:00:00.000Z';
    const mockEndDate = '2024-10-31T23:59:00.000Z';

    it('should add a start and end date', () => {
      const reducerState = rulesetReducer(defaultState, {
        type: 'dateTime',
        payload: {
          dateTime: [new Date(mockStartDate), new Date(mockEndDate)],
        },
      });

      expect(reducerState.startDate).toEqual(mockStartDate);
      expect(reducerState.endDate).toEqual(mockEndDate);
    });

    it('should remove a start and end date', () => {
      const reducerState = rulesetReducer(
        { ...defaultState, startDate: mockStartDate, endDate: mockEndDate },
        {
          type: 'dateTime',
          payload: {
            dateTime: [null, null],
          },
        }
      );

      expect(reducerState.startDate).toBeUndefined();
      expect(reducerState.endDate).toBeUndefined();
    });
  });
});
