import type { GlobalAttributesState } from './global-attribute-reducer';
import { globalAttributesReducer } from './global-attribute-reducer';

const mockInitialState: GlobalAttributesState = {
  selectedAttributes: [],
  allSelected: false,
  allDeselected: true,
  disableArrows: false,
};

describe('Global Attribute Reducer', () => {
  describe('TOGGLE_SELECTED_ATTRIBUTES', () => {
    it('should add an attribute when selected', () => {
      const state: GlobalAttributesState = {
        ...mockInitialState,
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
        ...mockInitialState,
        selectedAttributes: ['1'],
        allDeselected: false,
        disableArrows: true,
      });
    });

    it('should remove an attribute when deselected', () => {
      const state: GlobalAttributesState = {
        ...mockInitialState,
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
        ...mockInitialState,
        selectedAttributes: ['2'],
        allSelected: false,
        allDeselected: false,
        disableArrows: true,
      });
    });

    it('should add multiple attributes when merge group is selected', () => {
      const state: GlobalAttributesState = {
        ...mockInitialState,
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
        ...mockInitialState,
        selectedAttributes: ['1', '2', '3', '4'],
        allDeselected: false,
        disableArrows: true,
      });
    });

    it('should disable arrows when an attribute is selected', () => {
      const state: GlobalAttributesState = {
        ...mockInitialState,
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
        ...mockInitialState,
        selectedAttributes: ['1'],
        allDeselected: false,
        disableArrows: true,
      });
    });
  });
});
