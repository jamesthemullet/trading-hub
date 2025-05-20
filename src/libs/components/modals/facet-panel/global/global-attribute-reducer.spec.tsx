import type { FacetDisplayType } from '@/libs/modules/facets-panel/facets-panel-reducer';

import type { GlobalAttributesState } from './global-attribute-reducer';
import { globalAttributesReducer } from './global-attribute-reducer';

const mockInitialState: GlobalAttributesState = {
  selectedAttributes: [],
  allSelected: false,
  allDeselected: true,
  disableArrows: false,
  boostedRows: [],
  excludedRows: [],
  nonBoostedExcludedRows: [],
  merged: [],
  errorStates: {},
};

const mockState: GlobalAttributesState = {
  selectedAttributes: [],
  allSelected: false,
  allDeselected: true,
  disableArrows: false,
  boostedRows: [
    {
      displayName: 'Vegan',
      attributes: ['Vegan'],
      isMergeGroup: false,
    },
  ],
  excludedRows: [
    {
      displayName: 'Vegetarian',
      attributes: ['Vegetarian'],
      isMergeGroup: false,
    },
  ],
  nonBoostedExcludedRows: [
    {
      displayName: 'Under 10',
      attributes: ['Under 10'],
      isMergeGroup: false,
    },
    {
      displayName: 'test',
      attributes: ['value1', 'value2'],
      isMergeGroup: true,
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
  describe('TOGGLE_SELECTED_ATTRIBUTES', () => {
    it('should add an attribute when selected', () => {
      const state: GlobalAttributesState = {
        ...mockState,
      };
      const action = {
        type: 'TOGGLE_SELECTED_ATTRIBUTES' as const,
        payload: {
          attributes: ['1'],
          allSelected: false,
          allDeselected: false,
          disableArrows: true,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        selectedAttributes: ['1'],
        allDeselected: false,
        disableArrows: true,
      });
    });

    it('should remove an attribute when deselected', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        selectedAttributes: ['1', '2'],
        allDeselected: false,
      };
      const action = {
        type: 'TOGGLE_SELECTED_ATTRIBUTES' as const,
        payload: {
          attributes: ['1'],
          allSelected: false,
          allDeselected: false,
          disableArrows: true,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        selectedAttributes: ['2'],
        allSelected: false,
        allDeselected: false,
        disableArrows: true,
      });
    });

    it('should add multiple attributes when merge group is selected', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        selectedAttributes: ['1', '2'],
        allDeselected: false,
      };
      const action = {
        type: 'TOGGLE_SELECTED_ATTRIBUTES' as const,
        payload: {
          attributes: ['3', '4'],
          allSelected: false,
          allDeselected: false,
          disableArrows: true,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        selectedAttributes: ['1', '2', '3', '4'],
        allDeselected: false,
        disableArrows: true,
      });
    });

    it('should disable arrows when an attribute is selected', () => {
      const state: GlobalAttributesState = {
        ...mockState,
      };
      const action = {
        type: 'TOGGLE_SELECTED_ATTRIBUTES' as const,
        payload: {
          attributes: ['1'],
          allSelected: false,
          allDeselected: false,
          disableArrows: true,
        },
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        selectedAttributes: ['1'],
        allDeselected: false,
        disableArrows: true,
      });
    });
  });

  describe('CLEAR_SELECTED_ATTRIBUTES', () => {
    it('should clear selected attributes', () => {
      const state: GlobalAttributesState = {
        ...mockState,
        selectedAttributes: ['1', '2'],
        allSelected: false,
        allDeselected: false,
      };
      const action = {
        type: 'CLEAR_SELECTED_ATTRIBUTES' as const,
      };
      const result = globalAttributesReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        selectedAttributes: [],
        allSelected: false,
        allDeselected: true,
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
          },
        ],
        nonBoostedExcludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
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
          },
        ],
        nonBoostedExcludedRows: [
          {
            displayName: 'Vegetarian or Veggie',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
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
          },
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
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
          },
          {
            displayName: 'Under 10',
            attributes: ['Under 10'],
            isMergeGroup: false,
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
          },
          {
            displayName: 'Feather',
            attributes: ['Feather', 'Polyester'],
            isMergeGroup: true,
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
          },
        ],
        excludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian', 'Vegetarian Or Vegan'],
            isMergeGroup: true,
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
          },
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
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
            },
            {
              displayName: 'Vegan',
              attributes: ['Vegan'],
              isMergeGroup: false,
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
          },
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
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
          },
          {
            displayName: 'ROSIE',
            attributes: ['ROSIE'],
            isMergeGroup: false,
          },
          {
            displayName: 'SOSANDAR',
            attributes: ['SOSANDAR'],
            isMergeGroup: false,
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
          },
          {
            displayName: 'Vegan',
            attributes: ['Vegan'],
            isMergeGroup: false,
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
          },
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
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
          },
          {
            displayName: 'value1',
            attributes: ['value1'],
            isMergeGroup: false,
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
        },
        {
          displayName: 'value10',
          attributes: ['value10'],
          isMergeGroup: false,
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
        },
        {
          displayName: 'value10',
          attributes: ['value10'],
          isMergeGroup: false,
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
        },
      ],
      excludedRows: [
        {
          displayName: 'test2',
          attributes: ['value5', 'value6'],
          isMergeGroup: true,
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
        },
        {
          displayName: 'value2',
          attributes: ['value2'],
          isMergeGroup: false,
        },
        {
          displayName: 'value1',
          attributes: ['value1'],
          isMergeGroup: false,
        },
      ],
      boostedRows: [
        {
          displayName: 'test1',
          attributes: ['value3', 'value4'],
          isMergeGroup: true,
        },
      ],
      excludedRows: [
        {
          displayName: 'test2',
          attributes: ['value5', 'value6'],
          isMergeGroup: true,
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
        },
        {
          displayName: 'value1',
          attributes: ['value1'],
          isMergeGroup: false,
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
        },
        {
          displayName: 'value1',
          attributes: ['value1'],
          isMergeGroup: false,
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
