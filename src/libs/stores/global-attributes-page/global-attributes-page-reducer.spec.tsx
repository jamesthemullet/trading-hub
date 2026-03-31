import type { FacetDisplayType } from '@/libs/stores/facets-panel/facets-panel-reducer';

import type {
  GlobalAttributesPageState,
  RemoveFromCurrentMerge,
} from './global-attributes-page-reducer';
import { globalAttributesPageReducer } from './global-attributes-page-reducer';

const mockInitialState: GlobalAttributesPageState = {
  boostedRows: [],
  excludedRows: [],
  nonBoostedExcludedRows: [],
  merged: [],
  errorStates: {},
  currentMerge: {
    isOpen: false,
    displayValue: '',
    mergedValues: [],
    demergedValues: [],
    currentMergeValues: [],
  },
};

const mockState: GlobalAttributesPageState = {
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
  currentMerge: {
    isOpen: false,
    displayValue: '',
    mergedValues: [],
    demergedValues: [],
    currentMergeValues: [],
  },
};

describe('Global Attribute Reducer', () => {
  describe('TOGGLE_ALL_ATTRIBUTES', () => {
    it('should deselect all attributes when deselecting all', () => {
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockState,
      });
    });

    it('should select all attributes when selecting all', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
      };
      const action = {
        type: 'TOGGLE_ALL_ATTRIBUTES' as const,
        payload: {
          attributes: ['1'],
          allSelected: true,
        },
      };
      const result = globalAttributesPageReducer(state, action);
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

    it('should toggle a single selected attribute', () => {
      const state: GlobalAttributesPageState = {
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
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
      };

      const action = {
        type: 'TOGGLE_SELECTED_ATTRIBUTE' as const,
        payload: {
          displayName: 'Vegan',
        },
      };

      const result = globalAttributesPageReducer(state, action);

      expect(result.boostedRows[0].isChecked).toBe(true);
      expect(result.excludedRows[0].isChecked).toBe(false);
    });

    it('should toggle a non-boosted excluded attribute', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
        nonBoostedExcludedRows: [
          {
            displayName: 'OnlyOne',
            attributes: ['OnlyOne'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
        boostedRows: [],
        excludedRows: [],
      };

      const action = {
        type: 'TOGGLE_SELECTED_ATTRIBUTE' as const,
        payload: { displayName: 'OnlyOne' },
      };

      const result = globalAttributesPageReducer(state, action);

      expect(result.nonBoostedExcludedRows[0].isChecked).toBe(true);
    });

    it('should toggle an excluded attribute', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
        boostedRows: [],
        nonBoostedExcludedRows: [],
        excludedRows: [
          {
            displayName: 'OnlyExcluded',
            attributes: ['OnlyExcluded'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
      };

      const action = {
        type: 'TOGGLE_SELECTED_ATTRIBUTE' as const,
        payload: { displayName: 'OnlyExcluded' },
      };

      const result = globalAttributesPageReducer(state, action);

      expect(result.excludedRows[0].isChecked).toBe(true);
    });

    it('should not change any rows when displayName is not present', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
        boostedRows: [
          {
            displayName: 'A',
            attributes: ['A'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
        ],
        excludedRows: [
          {
            displayName: 'B',
            attributes: ['B'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
        nonBoostedExcludedRows: [],
      };

      const action = {
        type: 'TOGGLE_SELECTED_ATTRIBUTE' as const,
        payload: { displayName: 'NotPresent' },
      };

      const result = globalAttributesPageReducer(state, action);

      expect(result.boostedRows[0].isChecked).toBe(false);
      expect(result.excludedRows[0].isChecked).toBe(false);
    });
  });

  describe('AMEND_DISPLAY_NAME', () => {
    it('should amend display name of merge group', () => {
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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

    it('should update merged entry displayValue when it matches oldValue', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
        merged: [
          {
            displayValue: 'Vegetarian',
            mergedValues: ['Vegetarian', 'Veggie'],
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

      const result = globalAttributesPageReducer(state, action);

      expect(result.merged).toEqual([
        {
          displayValue: 'Vegetarian or Veggie',
          mergedValues: ['Vegetarian', 'Veggie'],
        },
      ]);
    });
  });

  describe('AMEND_BOOSTED_ROW', () => {
    it('should move boosted row', () => {
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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

  it('should amend display name of a boosted row', () => {
    const state: GlobalAttributesPageState = {
      ...mockState,
      boostedRows: [
        {
          displayName: 'OldBoost',
          attributes: ['OldBoost'],
          isMergeGroup: false,
          isChecked: false,
          order: 1,
        },
      ],
    };

    const action = {
      type: 'AMEND_DISPLAY_NAME' as const,
      payload: {
        oldValue: 'OldBoost',
        newValue: 'NewBoost',
      },
    };

    const result = globalAttributesPageReducer(state, action);

    expect(result.boostedRows[0].displayName).toBe('NewBoost');
  });

  describe('AMEND_NONBOOSTEDEXCLUDED_ROW', () => {
    it('should move non-boosted excluded row', () => {
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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

  it('should move non-boosted excluded row to boosted when newStatus is included', () => {
    const state: GlobalAttributesPageState = {
      ...mockState,
      nonBoostedExcludedRows: [
        {
          displayName: 'MoveMe',
          attributes: ['MoveMe'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
      boostedRows: [
        {
          displayName: 'Existing',
          attributes: ['Existing'],
          isMergeGroup: false,
          isChecked: false,
          order: 1,
        },
      ],
    };

    const action = {
      type: 'AMEND_NONBOOSTEDEXCLUDED_ROW' as const,
      payload: {
        displayName: 'MoveMe',
        newStatus: 'included' as FacetDisplayType,
      },
    };

    const result = globalAttributesPageReducer(state, action);

    expect(result.boostedRows.some((r) => r.displayName === 'MoveMe')).toBe(
      true
    );
    const moved = result.boostedRows.find((r) => r.displayName === 'MoveMe')!;
    expect(moved.order).toBe(2);
  });

  describe('AMEND_EXCLUDED_ROW', () => {
    it('should move excluded row', () => {
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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

  it('should move excluded row to nonBoostedExcludedRows when newStatus is algoControl', () => {
    const state: GlobalAttributesPageState = {
      ...mockState,
      excludedRows: [
        {
          displayName: 'AlgoRow',
          attributes: ['AlgoRow'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
      nonBoostedExcludedRows: [],
    };

    const action = {
      type: 'AMEND_EXCLUDED_ROW' as const,
      payload: {
        displayName: 'AlgoRow',
        newStatus: 'algoControl' as FacetDisplayType,
      },
    };

    const result = globalAttributesPageReducer(state, action);

    expect(
      result.nonBoostedExcludedRows.some((r) => r.displayName === 'AlgoRow')
    ).toBe(true);
  });

  describe('INITIALISE_STATE', () => {
    it('should initialise state', () => {
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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

  describe('ADD_NONBOOSTEDEXCLUDED_VALUES', () => {
    it('should append new values as non boosted excluded rows and avoid duplicates', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
      };

      const action = {
        type: 'ADD_NONBOOSTEDEXCLUDED_VALUES' as const,
        payload: {
          values: [
            { displayValue: 'Fresh Value' },
            { displayValue: 'Vegan' },
            { displayValue: 'Under 10' },
          ],
        },
      };

      const result = globalAttributesPageReducer(state, action);

      expect(result.nonBoostedExcludedRows).toEqual([
        ...state.nonBoostedExcludedRows,
        {
          displayName: 'Fresh Value',
          attributes: ['Fresh Value'],
          isMergeGroup: false,
          isChecked: false,
        },
      ]);
    });
  });

  describe('CHANGE_ROW_ORDER', () => {
    it('should change row order', () => {
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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
      const state: GlobalAttributesPageState = {
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
          displayValue: 'ROSIE',
        },
      };
      const result = globalAttributesPageReducer(state, action);
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
    const state: GlobalAttributesPageState = {
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
        displayValue: 'GOODMOVE',
      },
    };
    const result = globalAttributesPageReducer(state, action);
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

  it('should create merge group including non-boosted excluded rows', () => {
    const state: GlobalAttributesPageState = {
      ...mockState,
      nonBoostedExcludedRows: [
        {
          displayName: 'Alpha',
          attributes: ['Alpha'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
    };

    const action = {
      type: 'CREATE_MERGE_GROUP' as const,
      payload: {
        attributes: ['Alpha'],
        displayValue: 'AlphaGroup',
      },
    };

    const result = globalAttributesPageReducer(state, action);

    expect(
      result.nonBoostedExcludedRows.some((r) => r.displayName === 'AlphaGroup')
    ).toBe(true);
    expect(result.merged.some((m) => m.displayValue === 'AlphaGroup')).toBe(
      true
    );
  });

  describe('OPEN/CLOSE merge modal', () => {
    it('should open merge modal with payload', () => {
      const action = {
        type: 'OPEN_MERGE_GROUP_MODAL' as const,
        payload: {
          displayValue: 'X',
          mergedValues: ['a', 'b'],
        },
      };

      const result = globalAttributesPageReducer(mockState, action);

      expect(result.currentMerge.isOpen).toBe(true);
      expect(result.currentMerge.displayValue).toBe('X');
      expect(result.currentMerge.mergedValues).toEqual(['a', 'b']);
    });

    it('should close merge modal and clear values', () => {
      const action = {
        type: 'CLOSE_MERGE_GROUP_MODAL' as const,
      };

      const openState: GlobalAttributesPageState = {
        ...mockState,
        currentMerge: {
          isOpen: true,
          displayValue: 'Y',
          mergedValues: ['z'],
          currentMergeValues: ['z'],
          demergedValues: [],
        },
      };

      const result = globalAttributesPageReducer(openState, action);

      expect(result.currentMerge.isOpen).toBe(false);
      expect(result.currentMerge.displayValue).toBe('');
      expect(result.currentMerge.mergedValues).toEqual([]);
    });
  });

  describe('UPDATE_MERGE_GROUP', () => {
    it('should add new attribute to existing merge group', () => {
      const state: GlobalAttributesPageState = {
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
          displayValue: 'value1',
        },
      };
      const result = globalAttributesPageReducer(state, action);
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
      const state: GlobalAttributesPageState = {
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
          displayValue: 'value1',
        },
      };
      const result = globalAttributesPageReducer(state, action);
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
          {
            displayName: 'value1',
            attributes: ['value1', 'value2', 'value3'],
            isMergeGroup: true,
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

    it('should preserve the original merge group position when extending an existing non-boosted merge group', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
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
          {
            displayName: 'Over 20',
            attributes: ['Over 20'],
            isMergeGroup: false,
            isChecked: false,
          },
        ],
      };
      const action = {
        type: 'UPDATE_MERGE_GROUP' as const,
        payload: {
          attributes: ['value1', 'value2', 'Over 20'],
          isFirstAttributeBoosted: false,
          isFirstAttributeExcluded: false,
          displayValue: 'test',
        },
      };

      const result = globalAttributesPageReducer(state, action);

      expect(result.nonBoostedExcludedRows).toEqual([
        {
          displayName: 'Under 10',
          attributes: ['Under 10'],
          isMergeGroup: false,
          isChecked: false,
        },
        {
          displayName: 'test',
          attributes: ['value1', 'value2', 'Over 20'],
          isMergeGroup: true,
          isChecked: false,
        },
      ]);
    });

    it('should add new attribute and keep as excluded to existing merge group', () => {
      const state: GlobalAttributesPageState = {
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
          displayValue: 'value1',
        },
      };
      const result = globalAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        excludedRows: [
          {
            displayName: 'Vegetarian',
            attributes: ['Vegetarian'],
            isMergeGroup: false,
            isChecked: false,
          },
          {
            displayName: 'value1',
            attributes: ['value1', 'value2', 'value3'],
            isMergeGroup: true,
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
      const state: GlobalAttributesPageState = {
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
      const result = globalAttributesPageReducer(state, action);
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
    const state: GlobalAttributesPageState = {
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
    const result = globalAttributesPageReducer(state, action);
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
    const state: GlobalAttributesPageState = {
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
    const result = globalAttributesPageReducer(state, action);
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
    const state: GlobalAttributesPageState = {
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
    const result = globalAttributesPageReducer(state, action);
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
    const state: GlobalAttributesPageState = {
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
    const result = globalAttributesPageReducer(state, action);
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
    const state: GlobalAttributesPageState = {
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
    const result = globalAttributesPageReducer(state, action);
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

  it('early exits REMOVE_FROM_MERGE_GROUP if merge group not found', () => {
    const initialState = {
      ...mockInitialState,
      merged: [{ displayValue: 'Group Y', mergedValues: ['x', 'y'] }],
    };
    const action = {
      type: 'REMOVE_FROM_MERGE_GROUP' as const,
      payload: { valueToRemove: 'z', mergeDisplayName: 'Nonexistent Group' },
    };
    const result = globalAttributesPageReducer(initialState, action);
    expect(result).toBe(initialState);
  });

  describe('SET_ERROR', () => {
    it('should set error state', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
      };
      const action = {
        type: 'SET_ERROR' as const,
        payload: {
          displayName: 'test',
          message: 'Error message',
        },
      };
      const result = globalAttributesPageReducer(state, action);
      expect(result).toEqual({
        ...mockState,
        errorStates: {
          test: 'Error message',
        },
      });
    });

    it('should clear error state when message is empty', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
        errorStates: { foo: 'bar', test: 'Error message' },
      };

      const action = {
        type: 'SET_ERROR' as const,
        payload: {
          displayName: 'test',
          message: '',
        },
      };

      const result = globalAttributesPageReducer(state, action);

      expect(result.errorStates.test).toBeUndefined();
      expect(result.errorStates.foo).toBe('bar');
    });
  });

  describe('SET_BOOSTED_ORDER', () => {
    it('should reorder boosted rows when SET_BOOSTED_ORDER called', () => {
      const state: GlobalAttributesPageState = {
        ...mockState,
        boostedRows: [
          {
            displayName: 'A',
            attributes: ['A'],
            isMergeGroup: false,
            isChecked: false,
            order: 1,
          },
          {
            displayName: 'B',
            attributes: ['B'],
            isMergeGroup: false,
            isChecked: false,
            order: 2,
          },
          {
            displayName: 'C',
            attributes: ['C'],
            isMergeGroup: false,
            isChecked: false,
            order: 3,
          },
        ],
      };

      const action = {
        type: 'SET_BOOSTED_ORDER' as const,
        payload: {
          id: 'B',
          newIndex: 0,
        },
      };

      const result = globalAttributesPageReducer(state, action);

      expect(result.boostedRows[0].displayName).toBe('B');
      expect(result.boostedRows[0].order).toBe(1);
      expect(result.boostedRows[1].displayName).toBe('A');
    });
  });

  it('handles REMOVE_FROM_CURRENT_MERGE by removing the value from currentMerge.mergedValues', () => {
    const initialState = {
      ...mockInitialState,
      boostedRows: [
        {
          displayName: 'b',
          attributes: ['b'],
          isMergeGroup: false,
          isChecked: true,
          order: 1,
        },
        {
          displayName: 'a',
          attributes: ['a'],
          isMergeGroup: false,
          isChecked: false,
          order: 2,
        },
      ],
      excludedRows: [
        {
          displayName: 'b',
          attributes: ['b'],
          isMergeGroup: false,
          isChecked: true,
        },
        {
          displayName: 'c',
          attributes: ['c'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
      nonBoostedExcludedRows: [
        {
          displayName: 'b',
          attributes: ['b'],
          isMergeGroup: false,
          isChecked: true,
        },
        {
          displayName: 'd',
          attributes: ['d'],
          isMergeGroup: false,
          isChecked: false,
        },
      ],
      currentMerge: {
        isOpen: true,
        displayValue: 'Group X',
        mergedValues: ['a', 'b', 'c'],
        currentMergeValues: ['a', 'b', 'c'],
        demergedValues: [],
      },
    };
    const action: RemoveFromCurrentMerge = {
      type: 'REMOVE_FROM_CURRENT_MERGE',
      payload: { valueToRemove: 'b' },
    };
    const result = globalAttributesPageReducer(initialState, action);
    expect(result.currentMerge.mergedValues).toEqual(['a', 'c']);
    expect(
      result.boostedRows.find((r) => r.displayName === 'b')?.isChecked
    ).toBe(false);
    expect(
      result.excludedRows.find((r) => r.displayName === 'b')?.isChecked
    ).toBe(false);
    expect(
      result.nonBoostedExcludedRows.find((r) => r.displayName === 'b')
        ?.isChecked
    ).toBe(false);
  });

  describe('UPDATE_CURRENT_MERGE_VALUES', () => {
    it('should update currentMergeValues in currentMerge state', () => {
      const initialState = {
        ...mockInitialState,
        currentMerge: {
          isOpen: true,
          displayValue: 'Group A',
          mergedValues: ['a', 'b', 'c'],
          demergedValues: [],
          currentMergeValues: ['a', 'b', 'c'],
        },
      };
      const action = {
        type: 'UPDATE_CURRENT_MERGE_VALUES' as const,
        payload: {
          currentMergeValues: ['a', 'c'],
        },
      };
      const result = globalAttributesPageReducer(initialState, action);
      expect(result.currentMerge.currentMergeValues).toEqual(['a', 'c']);
      expect(result.currentMerge.mergedValues).toEqual(['a', 'b', 'c']);
      expect(result.currentMerge.demergedValues).toEqual([]);
      expect(result.currentMerge.displayValue).toBe('Group A');
    });
  });

  describe('RESET_CURRENT_MERGE_LOCAL_STATE', () => {
    it('should reset demergedValues and restore currentMergeValues to original mergedValues', () => {
      const initialState = {
        ...mockInitialState,
        currentMerge: {
          isOpen: true,
          displayValue: 'Group A',
          mergedValues: ['a', 'b', 'c'],
          demergedValues: ['b'],
          currentMergeValues: ['a', 'c'],
        },
      };
      const action = {
        type: 'RESET_CURRENT_MERGE_LOCAL_STATE' as const,
      };
      const result = globalAttributesPageReducer(initialState, action);
      expect(result.currentMerge.demergedValues).toEqual([]);
      expect(result.currentMerge.currentMergeValues).toEqual(['a', 'b', 'c']);
      expect(result.currentMerge.mergedValues).toEqual(['a', 'b', 'c']);
      expect(result.currentMerge.displayValue).toBe('Group A');
      expect(result.currentMerge.isOpen).toBe(true);
    });
  });
});
