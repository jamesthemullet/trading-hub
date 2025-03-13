import type { CountryCode, ReturnedFacet } from '@/libs/api';
import { toArrayWithSwappedElements } from '@/libs/components/modals/edit-facet/utils/swap-array-elements';

export type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

export type BaseDisplayValueMeta = {
  isBeginningOfDisplayTypeGroup: boolean;
  isEndOfDisplayTypeGroup: boolean;
};
export type FacetRowDisplayValue = ReturnedFacet & {
  meta?: BaseDisplayValueMeta;
  displayType: FacetDisplayType;
};

type MoveRowUpAction = {
  type: 'MOVE_INCLUDED_ROW_UP';
  payload: {
    id: string;
  };
};

type MoveRowDownAction = {
  type: 'MOVE_INCLUDED_ROW_DOWN';
  payload: {
    id: string;
  };
};

type ChangeDisplayTypeAction = {
  type: 'CHANGE_DISPLAY_TYPE';
  payload: {
    id: string;
    newDisplayType: FacetDisplayType;
  };
};

type InitialiseStateAction = {
  type: 'INITIALISE_STATE';
  payload: FacetPanelState;
};

type ChangeCountryAction = {
  type: 'changeCountry';
  payload: CountryCode;
};

export type Action =
  | MoveRowUpAction
  | MoveRowDownAction
  | ChangeDisplayTypeAction
  | InitialiseStateAction
  | ChangeCountryAction;

export type FacetPanelState = {
  excludedFacets: string[];
  includedFacets: string[];
  countryCode: CountryCode;
};

export const facetsPanelReducer = (
  state: FacetPanelState,
  action: Action
): FacetPanelState => {
  switch (action.type) {
    case 'MOVE_INCLUDED_ROW_UP': {
      const currentIncluded = state.includedFacets;
      const currentIndex = currentIncluded.indexOf(action.payload.id);
      return currentIndex > 0
        ? {
            ...state,
            includedFacets: toArrayWithSwappedElements(
              currentIncluded,
              currentIndex,
              currentIndex - 1
            ),
          }
        : state;
    }
    case 'MOVE_INCLUDED_ROW_DOWN': {
      const currentIncluded = state.includedFacets;
      const currentIndex = currentIncluded.indexOf(action.payload.id);
      return currentIndex < currentIncluded.length - 1
        ? {
            ...state,
            includedFacets: toArrayWithSwappedElements(
              currentIncluded,
              currentIndex,
              currentIndex + 1
            ),
          }
        : state;
    }
    case 'CHANGE_DISPLAY_TYPE': {
      const currentIncluded = state.includedFacets;
      const currentExcluded = state.excludedFacets;

      return {
        ...state,
        includedFacets:
          action.payload.newDisplayType !== 'included'
            ? state.includedFacets?.filter((val) => val !== action.payload.id)
            : [...currentIncluded, action.payload.id],
        excludedFacets:
          action.payload.newDisplayType !== 'excluded'
            ? state.excludedFacets?.filter((val) => val !== action.payload.id)
            : [...currentExcluded, action.payload.id],
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
