import { ReturnedGlobalFacet } from '@/libs/api';

import { facetReducer } from './facet-reducer';

const mockReturnedGlobalFacetState: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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

  describe('RENAME_DISPLAY_VALUE', () => {
    it('should rename display value that was not renamed before', () => {
      const state: ReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
      };
      const action = {
        type: 'RENAME_DISPLAY_VALUE' as const,
        payload: {
          id: 'color',
          newDisplayValue: 'colour',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        merged: [
          {
            displayValue: 'colour',
            mergedValues: ['color'],
          },
        ],
      });
    });

    it('should rename display value that was renamed before', () => {
      const state: ReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        merged: [
          {
            displayValue: 'color',
            mergedValues: ['color'],
          },
          {
            displayValue: 'purple',
            mergedValues: ['violet'],
          },
        ],
      };
      const action = {
        type: 'RENAME_DISPLAY_VALUE' as const,
        payload: {
          id: 'color',
          newDisplayValue: 'colour',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        merged: [
          {
            displayValue: 'colour',
            mergedValues: ['color'],
          },
          {
            displayValue: 'purple',
            mergedValues: ['violet'],
          },
        ],
      });
    });
  });

  describe('MERGE_SELECTED_ATTRIBUTE_VALUES', () => {
    it('should merge selected attribute values', () => {
      const state: ReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        merged: [
          {
            displayValue: undefined,
            mergedValues: undefined,
          },
          {
            displayValue: 'navy',
            mergedValues: ['blue'],
          },
          {
            displayValue: 'emerald',
            mergedValues: ['lime'],
          },
        ],
      };
      const action = {
        type: 'MERGE_SELECTED_ATTRIBUTE_VALUES' as const,
        payload: {
          selectedFacetAttributeValues: ['emerald', 'green'],
          displayValue: 'new display value',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        merged: [
          {
            displayValue: undefined,
            mergedValues: undefined,
          },
          {
            displayValue: 'navy',
            mergedValues: ['blue'],
          },
          {
            displayValue: 'new display value',
            mergedValues: ['lime', 'green'],
          },
        ],
      });
    });

    it('should merge selected attribute values when merged is undefined', () => {
      const state: ReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        merged: undefined,
      };
      const action = {
        type: 'MERGE_SELECTED_ATTRIBUTE_VALUES' as const,
        payload: {
          selectedFacetAttributeValues: ['emerald', 'green'],
          displayValue: 'new display value',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        merged: [
          {
            displayValue: 'new display value',
            mergedValues: ['emerald', 'green'],
          },
        ],
      });
    });

    it('should merge selected boosted and default attribute, keeping merge group boosted', () => {
      const state = {
        ...mockReturnedGlobalFacetState,
        boosted: ['Silk'],
        excludedValues: ['Merged 1', 'Merged 2'],
        merged: [
          {
            displayValue: 'test merged group',
            mergedValues: ['Merged 1', 'Merged 2'],
          },
        ],
      };
      const action = {
        type: 'MERGE_SELECTED_ATTRIBUTE_VALUES' as const,
        payload: {
          selectedFacetAttributeValues: [
            'Silk',
            'Other Merged 1',
            'Other Merged 2',
          ],
          displayValue: 'Name your merge',
        },
      };

      const result = facetReducer(state, action);

      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        boosted: ['Silk', 'Other Merged 1', 'Other Merged 2'],
        excludedValues: ['Merged 1', 'Merged 2'],
        merged: [
          {
            displayValue: 'test merged group',
            mergedValues: ['Merged 1', 'Merged 2'],
          },
          {
            displayValue: 'Name your merge',
            mergedValues: ['Silk', 'Other Merged 1', 'Other Merged 2'],
          },
        ],
      });
    });
  });

  describe('REMOVE_MERGED_VALUE', () => {
    it('should remove merged value', () => {
      const state: ReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        merged: [
          {
            displayValue: 'navy',
            mergedValues: ['blue'],
          },
          {
            displayValue: 'emerald',
            mergedValues: ['green', 'lime'],
          },
        ],
      };
      const action = {
        type: 'REMOVE_MERGED_VALUE' as const,
        payload: {
          mergeGroupDisplayName: 'emerald',
          attributeToRemove: 'green',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        merged: [
          {
            displayValue: 'navy',
            mergedValues: ['blue'],
          },
          {
            displayValue: 'emerald',
            mergedValues: ['lime'],
          },
        ],
      });
    });

    it('should remove merged value when merged is undefined', () => {
      const state: ReturnedGlobalFacet = {
        ...mockReturnedGlobalFacetState,
        merged: undefined,
      };
      const action = {
        type: 'REMOVE_MERGED_VALUE' as const,
        payload: {
          mergeGroupDisplayName: 'emerald',
          attributeToRemove: 'green',
        },
      };
      const result = facetReducer(state, action);
      expect(result).toEqual({
        ...mockReturnedGlobalFacetState,
        merged: undefined,
      });
    });
  });

  describe('CHANGE_DISPLAY_TYPE', () => {
    it('should change display type to boosted', () => {
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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

    it('should change display type from excluded to default', () => {
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
      const state: ReturnedGlobalFacet = {
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
