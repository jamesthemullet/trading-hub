import type { MerchandisingReturnedGlobalFacet } from '@/libs/api';

import { facetReducer } from './facet-reducer';

type FacetStateWithOrder = MerchandisingReturnedGlobalFacet & {
  orderedBoostedList: { displayValue: string; order: number }[];
};

const mockReturnedGlobalFacetState: FacetStateWithOrder = {
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
  orderedBoostedList: [
    { displayValue: '1', order: 1 },
    { displayValue: '2', order: 2 },
    { displayValue: '3', order: 3 },
  ],
};

describe('facetReducer', () => {
  describe('MOVE_BOOSTED_ROW_UP', () => {
    it('should move boosted row up', () => {
      const state: FacetStateWithOrder = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_UP' as const,
        payload: {
          id: '3',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '3', '2'],
        orderedBoostedList: [
          {
            displayValue: '1',
            order: 1,
          },
          {
            displayValue: '3',
            order: 2,
          },
          {
            displayValue: '2',
            order: 3,
          },
        ],
      });
    });

    it('should not move boosted row up if it is already at the top', () => {
      const state: FacetStateWithOrder = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_UP' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      });
    });

    it('should work with boosted equal to undefined', () => {
      const state: FacetStateWithOrder = {
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_UP' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      });
    });
  });

  describe('MOVE_BOOSTED_ROW_DOWN', () => {
    it('should move boosted row down', () => {
      const state: FacetStateWithOrder = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_DOWN' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['2', '1', '3'],
        orderedBoostedList: [
          {
            displayValue: '2',
            order: 1,
          },
          {
            displayValue: '1',
            order: 2,
          },
          {
            displayValue: '3',
            order: 3,
          },
        ],
      });
    });

    it('should not move boosted row down if it is already at the bottom', () => {
      const state: FacetStateWithOrder = {
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_DOWN' as const,
        payload: {
          id: '3',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2', '3'],
      });
    });

    it('should work with boosted equal to undefined', () => {
      const state: FacetStateWithOrder = {
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      };
      const action = {
        type: 'MOVE_BOOSTED_ROW_DOWN' as const,
        payload: {
          id: '1',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      });
    });
  });

  describe('CHANGE_DISPLAY_TYPE', () => {
    it('should change display type to boosted', () => {
      const state: FacetStateWithOrder = {
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
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1'],
        excludedValues: [],
        orderedBoostedList: [
          {
            displayValue: '1',
            order: 1,
          },
        ],
      });
    });

    it('should change group to boosted', () => {
      const state: FacetStateWithOrder = {
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
      const result = facetReducer(state, action);
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
        orderedBoostedList: [
          {
            displayValue: '1',
            order: 1,
          },
        ],
      });
    });

    it('should change display type from boosted to excluded', () => {
      const state: FacetStateWithOrder = {
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
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: [],
        excludedValues: ['1'],
        orderedBoostedList: [],
      });
    });

    it('should change display type from boosted to excluded with a merge group', () => {
      const state: FacetStateWithOrder = {
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
      const result = facetReducer(state, action);
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
        orderedBoostedList: [],
      });
    });

    it('should change display type from excluded to default', () => {
      const state: FacetStateWithOrder = {
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
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['2', '4'],
        excludedValues: ['1', '3'],
        orderedBoostedList: [
          {
            displayValue: '2',
            order: 1,
          },
          {
            displayValue: '4',
            order: 2,
          },
        ],
      });
    });

    it('should change display type when boosted is undefined and excludedValues is undefined', () => {
      const state: FacetStateWithOrder = {
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
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
        excludedValues: undefined,
        orderedBoostedList: [],
      });
    });
  });

  describe('SET_BOOSTED_ORDER', () => {
    it('should set boosted order', () => {
      const state: FacetStateWithOrder = {
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
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['3', '1', '2'],
        orderedBoostedList: [
          {
            displayValue: '3',
            order: 1,
          },
          {
            displayValue: '1',
            order: 2,
          },
          {
            displayValue: '2',
            order: 3,
          },
        ],
      });
    });
  });
});
