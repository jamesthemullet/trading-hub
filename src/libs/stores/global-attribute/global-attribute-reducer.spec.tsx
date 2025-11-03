import type { FacetDisplayType } from '@/libs/stores/facets-panel/facets-panel-reducer';

import type { GlobalAttributesState } from './global-attribute-reducer';
import { globalAttributesReducer } from './global-attribute-reducer';

const mockInitialState: GlobalAttributesState = {
  boostedRows: [],
  excludedRows: [],
  nonBoostedExcludedRows: [],
  merged: [],
  errorStates: {},
};

const mockState: GlobalAttributesState = {
  boostedRows: [
    {
      displayName: 'Vegan',
      attributes: ['Vegan'],
      isMergeGroup: false,
      isChecked: false,
      order: 1,
    },
  ],
  excludedRows: [
    {
      displayName: 'Vegetarian',
      attributes: ['Vegetarian'],
      isMergeGroup: false,
      isChecked: false,
    },
  ],
  nonBoostedExcludedRows: [
    {
      displayName: 'Under 10',
      attributes: ['Under 10'],
      isMergeGroup: false,
      isChecked: false,
    },
    {
      displayName: 'test',
      attributes: ['value1', 'value2'],
      isMergeGroup: true,
      isChecked: false,
    },
  ],
  merged: [
    {
      displayValue: 'test',
      mergedValues: ['value1', 'value2'],
    },
    {
      displayValue: 'Control',
      mergedValues: ['Magic tummy control', 'Firm control', 'Light control'],
    },
  ],
  errorStates: {},
};

describe('Global Attribute Reducer', () => {
  describe('TOGGLE_ALL_ATTRIBUTES', () => {
    it('should deselect all attributes when deselecting all', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        boostedRows: [
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
        ],
      };
      const action = {
        type: 'TOGGLE_ALL_ATTRIBUTES' as const,
        payload: {
          attributes: ['1'],
          allSelected: false,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
      });
    });

    it('should select all attributes when selecting all', () => {
      const state: GlobalAttributesState = {
        ...mockState,
      };
      const action = {
        type: 'TOGGLE_ALL_ATTRIBUTES' as const,
        payload: {
          attributes: ['1'],
          allSelected: true,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        boostedRows: [
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            order: 1,
            isChecked: true,
          },
        ],
        excludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: true,
          },
        ],
        nonBoostedExcludedRows: [
          {
            displayName: 'Under 10',
            attributes: ['Under 10'],
            isMergeGroup: false,
            isChecked: true,
          },
          {
            displayName: 'test',
            attributes: ['value1', 'value2'],
            isMergeGroup: true,
            isChecked: true,
          },
        ],
      });
    });
  });

  describe('AMEND_DISPLAY_NAME', () => {
    it('should amend display name of merge group', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        excludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian', 'Veggie'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
      };
      const action = {
        type: 'AMEND_DISPLAY_NAME' as const,
        payload: {
          oldValue: 'Vegetarian',
          newValue: 'Vegetarian or Veggie',
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        excludedRows: [
          {
            displayName: 'Vegetarian or Veggie',
            attributes: ['Vegetarian', 'Veggie'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
        merged: [
          {
            displayValue: 'test',
            mergedValues: ['value1', 'value2'],
          },
          {
            displayValue: 'Control',
            mergedValues: [
              'Magic tummy control',
              'Firm control',
              'Light control',
            ],
          },
        ],
      });
    });

    it('should amend display name of an attribute', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        excludedRows: [
          {
            displayName: 'Sweet',
            attributes: ['Sweet'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
        nonBoostedExcludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
      };
      const action = {
        type: 'AMEND_DISPLAY_NAME' as const,
        payload: {
          oldValue: 'Vegetarian',
          newValue: 'Vegetarian or Veggie',
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        excludedRows: [
          {
            displayName: 'Sweet',
            attributes: ['Sweet'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
        nonBoostedExcludedRows: [
          {
            displayName: 'Vegetarian or Veggie',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
        merged: [
          {
            displayValue: 'test',
            mergedValues: ['value1', 'value2'],
          },
          {
            displayValue: 'Control',
            mergedValues: [
              'Magic tummy control',
              'Firm control',
              'Light control',
            ],
          },
        ],
      });
    });
  });

  describe('AMEND_BOOSTED_ROW', () => {
    it('should move boosted row', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        boostedRows: [
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
        ],
      };
      const action = {
        type: 'AMEND_BOOSTED_ROW' as const,
        payload: {
          displayName: 'Vegan',
          newStatus: 'excluded' as FacetDisplayType,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        boostedRows: [],
        excludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
          },
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
      });
    });
  });

  describe('AMEND_NONBOOSTEDEXCLUDED_ROW', () => {
    it('should move non-boosted excluded row', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'Under 10',
            attributes: ['Under 10'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
      };
      const action = {
        type: 'AMEND_NONBOOSTEDEXCLUDED_ROW' as const,
        payload: {
          displayName: 'Under 10',
          newStatus: 'excluded' as FacetDisplayType,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        nonBoostedExcludedRows: [],
        excludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
          },
          {
            displayName: 'Under 10',
            attributes: ['Under 10'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
      });
    });

    it('should move boosted row and set order', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        boostedRows: [
          {
            displayName: 'Under 10',
            attributes: ['Under 10'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
            order: 2,
          },
        ],
        nonBoostedExcludedRows: [],
      };
      const action = {
        type: 'AMEND_BOOSTED_ROW' as const,
        payload: {
          displayName: 'Vegan',
          newStatus: 'algoControl' as FacetDisplayType,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isChecked: false,
            isMergeGroup: false,
          },
        ],
        excludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isChecked: false,
            isMergeGroup: false,
          },
        ],
        boostedRows: [
          {
            displayName: 'Under 10',
            attributes: ['Under 10'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
        ],
      });
    });
  });

  describe('AMEND_EXCLUDED_ROW', () => {
    it('should move excluded row', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        excludedRows: [
          {
            displayName: 'Feather',
            attributes: ['Feather', 'Polyester'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
      };
      const action = {
        type: 'AMEND_EXCLUDED_ROW' as const,
        payload: {
          displayName: 'Feather',
          newStatus: 'included' as FacetDisplayType,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        excludedRows: [],
        boostedRows: [
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
          {
            displayName: 'Feather',
            attributes: ['Feather', 'Polyester'],
            isMergeGroup: true,
            isChecked: false,
            order: 2,
          },
        ],
      });
    });
  });

  describe('INITIALISE_STATE', () => {
    it('should initialise state', () => {
      const state: GlobalAttributesState = {
        ...mockInitialState,
      };
      const action = {
        type: 'INITIALISE_STATE' as const,
        payload: {
          boostedValues: [
            {
              displayValue: 'Vegan',
            },
          ],
          excludedValues: [
            {
              displayValue: 'Vegetarian',
            },
            {
              displayValue: 'Vegetarian Or Vegan',
            },
          ],
          nonBoostedExcludedValues: [],
          merged: [
            {
              displayValue: 'Vegetarian',
              mergedValues: ['Vegetarian', 'Vegetarian Or Vegan'],
            },
          ],
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        boostedRows: [
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
        ],
        excludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian', 'Vegetarian Or Vegan'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
        nonBoostedExcludedRows: [],
        merged: [
          {
            displayValue: 'Vegetarian',
            mergedValues: ['Vegetarian', 'Vegetarian Or Vegan'],
          },
        ],
      });
    });
  });

  describe('CHANGE_ROW_ORDER', () => {
    it('should change row order', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        boostedRows: [
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
            order: 2,
          },
        ],
      };
      const action = {
        type: 'CHANGE_ROW_ORDER' as const,
        payload: {
          newOrder: [
            {
              displayName: 'Vegetarian',
              attributes: ['Vegetarian'],
              isMergeGroup: false,
              isChecked: false,
            },
            {
              displayName: 'Vegan',
              attributes: ['Vegan'],
              isMergeGroup: false,
              isChecked: false,
            },
          ],
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        boostedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
            order: 2,
          },
        ],
      });
    });
  });

  describe('CREATE_MERGE_GROUP', () => {
    it('should create merge group', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        boostedRows: [
          {
            displayName: 'GOODMOVE',
            attributes: ['GOODMOVE'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
          {
            displayName: 'ROSIE',
            attributes: ['ROSIE'],
            isMergeGroup: false,
            isChecked: false,
            order: 2,
          },
          {
            displayName: 'SOSANDAR',
            attributes: ['SOSANDAR'],
            isMergeGroup: false,
            isChecked: false,
            order: 3,
          },
        ],
      };
      const action = {
        type: 'CREATE_MERGE_GROUP' as const,
        payload: {
          attributes: ['ROSIE', 'GOODMOVE', 'SOSANDAR'],
          isFirstAttributeBoosted: true,
          isFirstAttributeExcluded: false,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        boostedRows: [
          {
            displayName: 'ROSIE',
            attributes: ['GOODMOVE', 'ROSIE', 'SOSANDAR'],
            isMergeGroup: true,
            isChecked: false,
            order: 1,
          },
        ],
        merged: [
          {
            displayValue: 'test',
            mergedValues: ['value1', 'value2'],
          },
          {
            displayValue: 'Control',
            mergedValues: [
              'Magic tummy control',
              'Firm control',
              'Light control',
            ],
          },
          {
            displayValue: 'ROSIE',
            mergedValues: ['GOODMOVE', 'ROSIE', 'SOSANDAR'],
          },
        ],
      });
    });
  });

  it('should create "faux" merge group when there is only one attribute, to pseudo process a display name change', () => {
    const state: GlobalAttributesState = {
      ...mockState,
      excludedRows: [
        {
          displayName: 'GOODMOVE',
          attributes: ['GOODMOVE'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
    };
    const action = {
      type: 'CREATE_MERGE_GROUP' as const,
      payload: {
        attributes: ['GOODMOVE'],
      },
    };
    const result = globalAttributesReducer(state, action);
    expect(result).toEqual({
      ...mockState,
      excludedRows: [
        {
          attributes: ['GOODMOVE'],
          displayName: 'GOODMOVE',
          isMergeGroup: true,
          isChecked: false,
        },
      ],
      merged: [
        {
          displayValue: 'test',
          mergedValues: ['value1', 'value2'],
        },
        {
          displayValue: 'Control',
          mergedValues: [
            'Magic tummy control',
            'Firm control',
            'Light control',
          ],
        },
        {
          displayValue: 'GOODMOVE',
          mergedValues: ['GOODMOVE'],
        },
      ],
    });
  });

  describe('UPDATE_MERGE_GROUP', () => {
    it('should add new attribute to existing merge group', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'test',
            attributes: ['value1', 'value2'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
      };
      const action = {
        type: 'UPDATE_MERGE_GROUP' as const,
        payload: {
          attributes: ['value1', 'value2', 'value3'],
          isFirstAttributeBoosted: false,
          isFirstAttributeExcluded: false,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'value1',
            attributes: ['value1', 'value2', 'value3'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
        merged: [
          {
            displayValue: 'Control',
            mergedValues: [
              'Magic tummy control',
              'Firm control',
              'Light control',
            ],
          },
          {
            displayValue: 'value1',
            mergedValues: ['value1', 'value2', 'value3'],
          },
        ],
      });
    });

    it('should add new attribute and keep as included to existing merge group', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'test',
            attributes: ['value1', 'value2'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
      };
      const action = {
        type: 'UPDATE_MERGE_GROUP' as const,
        payload: {
          attributes: ['value1', 'value2', 'value3'],
          isFirstAttributeBoosted: true,
          isFirstAttributeExcluded: false,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        boostedRows: [
          {
            displayName: 'value1',
            attributes: ['value1', 'value2', 'value3'],
            isMergeGroup: true,
            isChecked: false,
            order: 1,
          },
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
            isChecked: false,
            order: 2,
          },
        ],
        nonBoostedExcludedRows: [],
        merged: [
          {
            displayValue: 'Control',
            mergedValues: [
              'Magic tummy control',
              'Firm control',
              'Light control',
            ],
          },
          {
            displayValue: 'value1',
            mergedValues: ['value1', 'value2', 'value3'],
          },
        ],
      });
    });

    it('should add new attribute and keep as excluded to existing merge group', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'test',
            attributes: ['value1', 'value2'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
      };
      const action = {
        type: 'UPDATE_MERGE_GROUP' as const,
        payload: {
          attributes: ['value1', 'value2', 'value3'],
          isFirstAttributeBoosted: false,
          isFirstAttributeExcluded: true,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        excludedRows: [
          {
            displayName: 'value1',
            attributes: ['value1', 'value2', 'value3'],
            isMergeGroup: true,
            isChecked: false,
          },
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
        nonBoostedExcludedRows: [],
        merged: [
          {
            displayValue: 'Control',
            mergedValues: [
              'Magic tummy control',
              'Firm control',
              'Light control',
            ],
          },
          {
            displayValue: 'value1',
            mergedValues: ['value1', 'value2', 'value3'],
          },
        ],
      });
    });
  });

  describe('REMOVE_FROM_MERGE_GROUP', () => {
    it('should remove attribute from nonBoostedExcludedRows merge group and keep it in nonBoostedExcludedRows', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'test',
            attributes: ['value1', 'value2', 'value3'],
            isMergeGroup: true,
            isChecked: false,
          },
        ],
        merged: [
          {
            displayValue: 'test',
            mergedValues: ['value1', 'value2', 'value3'],
          },
        ],
      };
      const action = {
        type: 'REMOVE_FROM_MERGE_GROUP' as const,
        payload: {
          valueToRemove: 'value1',
          mergeDisplayName: 'test',
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'test',
            attributes: ['value2', 'value3'],
            isMergeGroup: true,
            isChecked: false,
          },
          {
            displayName: 'value1',
            attributes: ['value1'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
        merged: [
          {
            displayValue: 'test',
            mergedValues: ['value2', 'value3'],
          },
        ],
      });
    });
  });

  it('should remove attribute from boostedRows merge group and keep it in boostedRows', () => {
    const state: GlobalAttributesState = {
      ...mockState,
      boostedRows: [
        {
          displayName: 'test10',
          attributes: ['value10', 'value20', 'value30'],
          isMergeGroup: true,
          isChecked: false,
          order: 1,
        },
      ],
      merged: [
        {
          displayValue: 'test10',
          mergedValues: ['value10', 'value20', 'value30'],
        },
      ],
    };
    const action = {
      type: 'REMOVE_FROM_MERGE_GROUP' as const,
      payload: {
        valueToRemove: 'value10',
        mergeDisplayName: 'test10',
      },
    };
    const result = globalAttributesReducer(state, action);
    expect(result).toEqual({
      ...mockState,
      boostedRows: [
        {
          displayName: 'test10',
          attributes: ['value20', 'value30'],
          isMergeGroup: true,
          isChecked: false,
          order: 1,
        },
        {
          displayName: 'value10',
          attributes: ['value10'],
          isMergeGroup: false,
          isChecked: false,
          order: 2,
        },
      ],
      merged: [
        {
          displayValue: 'test10',
          mergedValues: ['value20', 'value30'],
        },
      ],
    });
  });

  it('should remove attribute from excludedRows merge group and keep it in excludedRows', () => {
    const state: GlobalAttributesState = {
      ...mockState,
      excludedRows: [
        {
          displayName: 'test10',
          attributes: ['value10', 'value20', 'value30'],
          isMergeGroup: true,
          isChecked: false,
        },
      ],
      merged: [
        {
          displayValue: 'test10',
          mergedValues: ['value10', 'value20', 'value30'],
        },
      ],
    };
    const action = {
      type: 'REMOVE_FROM_MERGE_GROUP' as const,
      payload: {
        valueToRemove: 'value10',
        mergeDisplayName: 'test10',
      },
    };
    const result = globalAttributesReducer(state, action);
    expect(result).toEqual({
      ...mockState,
      excludedRows: [
        {
          displayName: 'test10',
          attributes: ['value20', 'value30'],
          isMergeGroup: true,
          isChecked: false,
        },
        {
          displayName: 'value10',
          attributes: ['value10'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
      merged: [
        {
          displayValue: 'test10',
          mergedValues: ['value20', 'value30'],
        },
      ],
    });
  });

  it('should disband nonBoostedExcludedRows merge group when removing penultimate attribute, and return all items to nonBoostedExcludedRows', () => {
    const state: GlobalAttributesState = {
      ...mockState,
      boostedRows: [
        {
          displayName: 'test1',
          attributes: ['value3', 'value4'],
          isMergeGroup: true,
          isChecked: false,
          order: 1,
        },
      ],
      excludedRows: [
        {
          displayName: 'test2',
          attributes: ['value5', 'value6'],
          isMergeGroup: true,
          isChecked: false,
        },
      ],
      merged: [
        {
          displayValue: 'test',
          mergedValues: ['value1', 'value2'],
        },
        {
          displayValue: 'Control',
          mergedValues: [
            'Magic tummy control',
            'Firm control',
            'Light control',
          ],
        },
        {
          displayValue: 'test1',
          mergedValues: ['value3', 'value4'],
        },
        {
          displayValue: 'test2',
          mergedValues: ['value5', 'value6'],
        },
      ],
    };
    const action = {
      type: 'REMOVE_FROM_MERGE_GROUP' as const,
      payload: {
        valueToRemove: 'value1',
        mergeDisplayName: 'test',
      },
    };
    const result = globalAttributesReducer(state, action);
    expect(result).toEqual({
      ...mockState,
      nonBoostedExcludedRows: [
        {
          displayName: 'Under 10',
          attributes: ['Under 10'],
          isMergeGroup: false,
          isChecked: false,
        },
        {
          displayName: 'value2',
          attributes: ['value2'],
          isMergeGroup: false,
          isChecked: false,
        },
        {
          displayName: 'value1',
          attributes: ['value1'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
      boostedRows: [
        {
          displayName: 'test1',
          attributes: ['value3', 'value4'],
          isMergeGroup: true,
          isChecked: false,
          order: 1,
        },
      ],
      excludedRows: [
        {
          displayName: 'test2',
          attributes: ['value5', 'value6'],
          isMergeGroup: true,
          isChecked: false,
        },
      ],
      merged: [
        {
          displayValue: 'Control',
          mergedValues: [
            'Magic tummy control',
            'Firm control',
            'Light control',
          ],
        },
        {
          displayValue: 'test1',
          mergedValues: ['value3', 'value4'],
        },
        {
          displayValue: 'test2',
          mergedValues: ['value5', 'value6'],
        },
      ],
    });
  });

  it('should disband boostedRows merge group when removing penultimate attribute, and return all items to boostedRows', () => {
    const state: GlobalAttributesState = {
      ...mockState,
      boostedRows: [
        {
          displayName: 'test',
          attributes: ['value1', 'value2'],
          isMergeGroup: true,
          isChecked: false,
          order: 1,
        },
      ],
      nonBoostedExcludedRows: [],
    };
    const action = {
      type: 'REMOVE_FROM_MERGE_GROUP' as const,
      payload: {
        valueToRemove: 'value1',
        mergeDisplayName: 'test',
      },
    };
    const result = globalAttributesReducer(state, action);
    expect(result).toEqual({
      ...mockState,
      boostedRows: [
        {
          displayName: 'value2',
          attributes: ['value2'],
          isMergeGroup: false,
          isChecked: false,
          order: 1,
        },
        {
          displayName: 'value1',
          attributes: ['value1'],
          isMergeGroup: false,
          isChecked: false,
          order: 2,
        },
      ],
      nonBoostedExcludedRows: [],
      merged: [
        {
          displayValue: 'Control',
          mergedValues: [
            'Magic tummy control',
            'Firm control',
            'Light control',
          ],
        },
      ],
    });
  });

  it('should disband excludedRows merge group when removing penultimate attribute, and return all items to their original group', () => {
    const state: GlobalAttributesState = {
      ...mockState,
      nonBoostedExcludedRows: [],
      excludedRows: [
        {
          displayName: 'test',
          attributes: ['value1', 'value2'],
          isMergeGroup: true,
          isChecked: false,
        },
      ],
    };
    const action = {
      type: 'REMOVE_FROM_MERGE_GROUP' as const,
      payload: {
        valueToRemove: 'value1',
        mergeDisplayName: 'test',
      },
    };
    const result = globalAttributesReducer(state, action);
    expect(result).toEqual({
      ...mockState,
      nonBoostedExcludedRows: [],
      excludedRows: [
        {
          displayName: 'value2',
          attributes: ['value2'],
          isMergeGroup: false,
          isChecked: false,
        },
        {
          displayName: 'value1',
          attributes: ['value1'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
      merged: [
        {
          displayValue: 'Control',
          mergedValues: [
            'Magic tummy control',
            'Firm control',
            'Light control',
          ],
        },
      ],
    });
  });

  describe('SET_ERROR', () => {
    it('should set error state', () => {
      const state: GlobalAttributesState = {
        ...mockState,
      };
      const action = {
        type: 'SET_ERROR' as const,
        payload: {
          displayName: 'test',
          message: 'Error message',
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        errorStates: {
          test: 'Error message',
        },
      });
    });
  });
});
