import type {
  MerchandisingCountryCode,
  MerchandisingReturnedFacet,
} from '@/libs/api';

export type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

type BaseDisplayValueMeta = {
  isBeginningOfDisplayTypeGroup: boolean;
  isEndOfDisplayTypeGroup: boolean;
};
export type FacetRowDisplayValue = MerchandisingReturnedFacet & {
  meta?: BaseDisplayValueMeta;
  displayType: FacetDisplayType;
};

type ChangeDisplayTypeAction = {
  type: 'CHANGE_DISPLAY_TYPE';
  payload: {
    id: string;
    newDisplayType: FacetDisplayType;
  };
};

type SetIncludedOrderAction = {
  type: 'SET_INCLUDED_ORDER';
  payload: {
    id: string;
    newIndex: number;
  };
};

type InitialiseStateAction = {
  type: 'INITIALISE_STATE';
  payload: FacetPanelState;
};

type ChangeCountryAction = {
  type: 'changeCountry';
  payload: MerchandisingCountryCode;
};

export type Action =
  | ChangeDisplayTypeAction
  | SetIncludedOrderAction
  | InitialiseStateAction
  | ChangeCountryAction;

export type FacetPanelState = {
  excludedFacets: string[];
  includedFacets: string[];
  countryCode: MerchandisingCountryCode;
  orders: Record<string, number>;
};

export const facetsPanelReducer = (
  state: FacetPanelState,
  action: Action
): FacetPanelState => {
  switch (action.type) {
    case 'SET_INCLUDED_ORDER': {
      const { id, newIndex } = action.payload;
      const currentIncluded = state.includedFacets;
      const currentIndex = currentIncluded.indexOf(id);

      if (currentIndex === -1 || newIndex < 0) {
        return state;
      }

      // Clamp the newIndex to valid range
      const maxIndex = currentIncluded.length - 1;
      const clampedIndex = Math.min(newIndex, maxIndex);

      const movedFacet = currentIncluded[currentIndex];
      const updatedIncluded = [
        ...currentIncluded.slice(0, currentIndex),
        ...currentIncluded.slice(currentIndex + 1),
      ];
      const finalIncluded = [
        ...updatedIncluded.slice(0, clampedIndex),
        movedFacet,
        ...updatedIncluded.slice(clampedIndex),
      ];

      const updatedOrders = Object.fromEntries(
        finalIncluded.map((facetId, index) => [facetId, index + 1])
      );

      return {
        ...state,
        includedFacets: finalIncluded,
        orders: updatedOrders,
      };
    }
    case 'CHANGE_DISPLAY_TYPE': {
      const { id, newDisplayType } = action.payload;
      const currentIncluded = state.includedFacets.filter((val) => val !== id);
      const currentExcluded = state.excludedFacets.filter((val) => val !== id);

      const finalIncluded =
        newDisplayType === 'included'
          ? [...currentIncluded, id]
          : currentIncluded;

      const reorderedIncluded = Object.fromEntries(
        finalIncluded.map((facetId, index) => [facetId, index + 1])
      );

      return {
        ...state,
        includedFacets: finalIncluded,
        excludedFacets:
          newDisplayType === 'excluded'
            ? [...currentExcluded, id]
            : currentExcluded,
        orders: reorderedIncluded,
      };
    }
    case 'INITIALISE_STATE': {
      return action.payload;
    }
    case 'changeCountry': {
      const { payload } = action;

      return {
        ...state,
        countryCode: payload,
      };
    }
  }
};
