import type { ReturnedGlobalFacet } from '@/libs/api';

import type { AttributeDisplayType } from '../types';
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
    newDisplayType: AttributeDisplayType;
  };
};

export type Action =
  | MoveRowUpAction
  | MoveRowDownAction
  | ChangeDisplayTypeAction;

export const facetReducer = (
  state: ReturnedGlobalFacet,
  action: Action
): ReturnedGlobalFacet => {
  switch (action.type) {
    case 'MOVE_BOOSTED_ROW_UP': {
      const currentBoosted = state.boosted ?? [];
      const currentIndex = currentBoosted.indexOf(action.payload.id);
      return currentIndex > 0
        ? {
            ...state,
            boosted: toArrayWithSwappedElements(
              currentBoosted,
              currentIndex,
              currentIndex - 1
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
      const currentMerged = state.merged ?? [];

      const group = currentMerged.find((merge) =>
        merge.mergedValues?.includes(action.payload.id)
      );

      if (group?.mergedValues) {
        const groupValues = group.mergedValues;
        return {
          ...state,
          boosted:
            action.payload.newDisplayType === 'boosted'
              ? [...currentBoosted, ...groupValues]
              : currentBoosted.filter((val) => !groupValues.includes(val)),
          excludedValues:
            action.payload.newDisplayType === 'excluded'
              ? [...currentExcludedValues, ...groupValues]
              : currentExcludedValues.filter(
                  (val) => !groupValues.includes(val)
                ),
        };
      } else {
        return {
          ...state,
          boosted:
            action.payload.newDisplayType !== 'boosted'
              ? state.boosted?.filter((val) => val !== action.payload.id)
              : [...currentBoosted, action.payload.id],
          excludedValues:
            action.payload.newDisplayType !== 'excluded'
              ? state.excludedValues?.filter((val) => val !== action.payload.id)
              : [...currentExcludedValues, action.payload.id],
        };
      }
    }
  }
};
