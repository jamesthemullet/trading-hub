import type { MerchandisingReturnedGlobalFacet } from '@/libs/api';

import { facetAttributesPageReducer } from './facet-attributes-page-reducer';

const mockReturnedGlobalFacetState: MerchandisingReturnedGlobalFacet = {
  type: 'root',
  id: 'color',
  lastChanged: {
    date: '2021-10-01',
    user: 'Bob',
  },
  displayValue: 'color',
  indexPropertyName: 'color',
  boosted: ['1', '2', '3'],
  excludedValues: [],
};

describe('facetAttributesPageReducer', () => {
  describe('MOVE_BOOSTED_ROW_UP', () => {
    it('should move boosted row up', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_UP' as const,
        payload: {
          id: '3',
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '3', '2'],
      });
    });

    it('should not move boosted row up if it is already at the top', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_UP' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      });
    });

    it('should work with boosted equal to undefined', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_UP' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      });
    });
  });

  describe('MOVE_BOOSTED_ROW_DOWN', () => {
    it('should move boosted row down', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_DOWN' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['2', '1', '3'],
      });
    });

    it('should not move boosted row down if it is already at the bottom', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_DOWN' as const,
        payload: {
          id: '3',
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      });
    });

    it('should work with boosted equal to undefined', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_DOWN' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      });
    });
  });

  describe('CHANGE_DISPLAY_TYPE', () => {
    it('should not create duplicate when already included', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2'],
        excludedValues: [],
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'included' as const,
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2'],
        excludedValues: [],
      });
    });

    it('should change display type to boosted', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: [],
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'included' as const,
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1'],
        excludedValues: [],
      });
    });

    it('should change group to boosted', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: [],
        merged: [
          {
            displayValue: 'group',
            mergedValues: ['1'],
          },
        ],
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'included' as const,
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1'],
        excludedValues: [],
        merged: [
          {
            displayValue: 'group',
            mergedValues: ['1'],
          },
        ],
      });
    });

    it('should change display type from boosted to excluded', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1'],
        excludedValues: [],
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'excluded' as const,
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: [],
        excludedValues: ['1'],
      });
    });

    it('should change display type from boosted to excluded with a merge group', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1'],
        excludedValues: [],
        merged: [
          {
            displayValue: 'group',
            mergedValues: ['1'],
          },
        ],
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'excluded' as const,
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: [],
        excludedValues: ['1'],
        merged: [
          {
            displayValue: 'group',
            mergedValues: ['1'],
          },
        ],
      });
    });

    it('should change display type from excluded to default', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['2', '4'],
        excludedValues: ['1', '3'],
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '5',
          newDisplayType: 'algoControl' as const,
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['2', '4'],
        excludedValues: ['1', '3'],
      });
    });

    it('should change display type when boosted is undefined and excludedValues is undefined', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
        excludedValues: undefined,
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'algoControl' as const,
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
        excludedValues: undefined,
      });
    });
  });

  describe('SET_BOOSTED_ORDER', () => {
    it('should set boosted order', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'SET_BOOSTED_ORDER' as const,
        payload: {
          id: '3',
          newIndex: 0,
        },
      };
      const result = facetAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['3', '1', '2'],
      });
    });
  });

  describe('RESTORE_STATE', () => {
    it('should restore to the given state snapshot', () => {
      const previousState: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: ['x'],
        excludedValues: ['y'],
      };
      const result = facetAttributesPageReducer(
        { ...mockReturnedGlobalFacetState, boosted: ['1', '2', '3'] },
        { type: 'RESTORE_STATE', payload: previousState }
      );
      expect(result).toEqual(previousState);
    });
  });
});
