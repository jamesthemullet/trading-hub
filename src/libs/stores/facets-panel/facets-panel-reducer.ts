import type {
  MerchandisingCountryCode,
  MerchandisingReturnedFacet,
} from '@/libs/api';
import { toArrayWithSwappedElements } from '@/libs/features/facets/utils/swap-array-elements';

export type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

export type BaseDisplayValueMeta = {
  isBeginningOfDisplayTypeGroup: boolean;
  isEndOfDisplayTypeGroup: boolean;
};
export type FacetRowDisplayValue = MerchandisingReturnedFacet & {
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
  payload: MerchandisingCountryCode;
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
  countryCode: MerchandisingCountryCode;
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
      const { id, newDisplayType } = action.payload;
      const currentIncluded = state.includedFacets.filter((val) => val !== id);
      const currentExcluded = state.excludedFacets.filter((val) => val !== id);

      return {
        ...state,
        includedFacets:
          newDisplayType === 'included'
            ? [...currentIncluded, id]
            : currentIncluded,
        excludedFacets:
          newDisplayType === 'excluded'
            ? [...currentExcluded, id]
            : currentExcluded,
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
