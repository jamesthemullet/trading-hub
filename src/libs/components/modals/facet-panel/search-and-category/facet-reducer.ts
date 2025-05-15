import type { MerchandisingRuleSetFacetConfigWithId } from '@/libs/api';
import type { FacetDisplayType } from '@/libs/modules/facets-panel/facets-panel-reducer';

import { toArrayWithSwappedElements } from '../utils/swap-array-elements';

type MoveRowUpAction = {
  type: 'MOVE_BOOSTED_ROW_UP';
  payload: {
    id: string;
  };
};

type MoveRowDownAction = {
  type: 'MOVE_BOOSTED_ROW_DOWN';
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

export type Action =
  | MoveRowUpAction
  | MoveRowDownAction
  | ChangeDisplayTypeAction;

export const facetReducer = (
  state: MerchandisingRuleSetFacetConfigWithId & { displayValue: string },
  action: Action
): MerchandisingRuleSetFacetConfigWithId & { displayValue: string } => {
  switch (action.type) {
    case 'MOVE_BOOSTED_ROW_UP': {
      const currentBoosted = state.boosted ?? [];
      const currentIndex = currentBoosted.indexOf(action.payload.id);
      const updatedBoosted = currentBoosted.filter(
        (val) => val !== action.payload.id
      );
      return currentIndex > 0
        ? {
            ...state,
            boosted: updatedBoosted.toSpliced(
              currentIndex - 1,
              0,
              action.payload.id
            ),
          }
        : state;
    }
    case 'MOVE_BOOSTED_ROW_DOWN': {
      const currentBoosted = state.boosted ?? [];
      const currentIndex = currentBoosted.indexOf(action.payload.id);
      return currentIndex < currentBoosted.length - 1
        ? {
            ...state,
            boosted: toArrayWithSwappedElements(
              currentBoosted,
              currentIndex,
              currentIndex + 1
            ),
          }
        : state;
    }
    case 'CHANGE_DISPLAY_TYPE': {
      const currentBoosted = state.boosted ?? [];
      const currentExcludedValues = state.excludedValues ?? [];
      return {
        ...state,
        boosted:
          action.payload.newDisplayType !== 'included'
            ? state.boosted?.filter((val) => val !== action.payload.id)
            : [...currentBoosted, action.payload.id],
        excludedValues:
          action.payload.newDisplayType !== 'excluded'
            ? state.excludedValues?.filter((val) => val !== action.payload.id)
            : [...currentExcludedValues, action.payload.id],
      };
    }
  }
};
