import type { MerchandisingReturnedFacet } from '@/libs/api';

export type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

export type BaseDisplayValueMeta = {
  isBeginningOfDisplayTypeGroup: boolean;
  isEndOfDisplayTypeGroup: boolean;
};
export type FacetRowDisplayValue = MerchandisingReturnedFacet & {
  meta?: BaseDisplayValueMeta;
  displayType: FacetDisplayType;
};

export type ToggleSelectedAttribute = {
  type: 'TOGGLE_SELECTED_ATTRIBUTES';
  payload: {
    attributes: string[];
    allSelected: boolean;
    allDeselected: boolean;
    disableArrows?: boolean;
  };
};

type ClearSelectedAttributes = {
  type: 'CLEAR_SELECTED_ATTRIBUTES';
};

export type Action = ToggleSelectedAttribute | ClearSelectedAttributes;

export type GlobalAttributesState = {
  selectedAttributes: string[];
  allSelected: boolean;
  allDeselected: boolean;
  disableArrows: boolean;
};

export const globalAttributesReducer = (
  state: GlobalAttributesState,
  action: Action
): GlobalAttributesState => {
  switch (action.type) {
    case 'TOGGLE_SELECTED_ATTRIBUTES': {
      const { attributes, allSelected, allDeselected } = action.payload;

      if (allSelected) {
        return {
          ...state,
          selectedAttributes: [...attributes],
          allSelected: true,
          allDeselected: false,
          disableArrows: true,
        };
      }

      if (allDeselected && attributes.length === 0) {
        return {
          ...state,
          selectedAttributes: [],
          allSelected: false,
          allDeselected: true,
          disableArrows: false,
        };
      }

      const selectedAttributes = state.selectedAttributes.filter(
        (name) => !attributes.includes(name)
      );

      const newSelectedAttributes = [
        ...selectedAttributes,
        ...attributes.filter(
          (name) => !state.selectedAttributes.includes(name)
        ),
      ];

      return {
        ...state,
        selectedAttributes: newSelectedAttributes,
        allSelected,
        allDeselected: newSelectedAttributes.length === 0,
        disableArrows: newSelectedAttributes.length > 0,
      };
    }

    case 'CLEAR_SELECTED_ATTRIBUTES': {
      return {
        ...state,
        selectedAttributes: [],
        allSelected: false,
        allDeselected: true,
        disableArrows: false,
      };
    }
  }
};
