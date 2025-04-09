import type { MerchandisingReturnedGlobalFacet } from '@/libs/api';

import { facetReducer } from './facet-reducer';

const mockReturnedGlobalFacetState: MerchandisingReturnedGlobalFacet = {
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

describe('facetReducer', () => {
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
      const result = facetReducer(state, action);
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
      const result = facetReducer(state, action);
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
      const result = facetReducer(state, action);
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
      const result = facetReducer(state, action);
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
      const result = facetReducer(state, action);
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
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
      });
    });
  });

  describe('CHANGE_DISPLAY_TYPE', () => {
    it('should change display type to boosted', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: [],
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'boosted' as const,
        },
      };
      const result = facetReducer(state, action);
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
          newDisplayType: 'boosted' as const,
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
      const result = facetReducer(state, action);
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
          newDisplayType: 'default' as const,
        },
      };
      const result = facetReducer(state, action);
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
          newDisplayType: 'default' as const,
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: undefined,
        excludedValues: undefined,
      });
    });

    it('should change display type of merge group from excluded to boosted', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: [],
        excludedValues: ['1', '2'],
        merged: [
          {
            displayValue: 'test merged group',
            mergedValues: ['1', '2'],
          },
        ],
      };
      const action = {
        type: 'CHANGE_DISPLAY_TYPE' as const,
        payload: {
          id: '1',
          newDisplayType: 'boosted' as const,
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['1', '2'],
        excludedValues: [],
        merged: [
          {
            displayValue: 'test merged group',
            mergedValues: ['1', '2'],
          },
        ],
      });
    });

    it('should change display type of merge group from default to excluded', () => {
      const state: MerchandisingReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        boosted: [],
        excludedValues: [],
        merged: [
          {
            displayValue: 'test merged group',
            mergedValues: ['1', '2'],
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
        excludedValues: ['1', '2'],
        merged: [
          {
            displayValue: 'test merged group',
            mergedValues: ['1', '2'],
          },
        ],
      });
    });
  });
});
