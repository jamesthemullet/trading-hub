import type { MerchandisingRuleSetFacetConfigWithId } from '@/libs/api';
import { toArrayWithSwappedElements } from '@/libs/features/facets/utils/swap-array-elements';
import type { FacetDisplayType } from '@/types/facets';

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

type SetBoostedOrderAction = {
  type: 'SET_BOOSTED_ORDER';
  payload: {
    id: string;
    newIndex: number;
  };
};

type ChangeDisplayTypeAction = {
  type: 'CHANGE_DISPLAY_TYPE';
  payload: {
    id: string;
    newDisplayType: FacetDisplayType;
  };
};

type Action =
  | MoveRowUpAction
  | MoveRowDownAction
  | ChangeDisplayTypeAction
  | SetBoostedOrderAction;

export const facetReducer = (
  state: MerchandisingRuleSetFacetConfigWithId & {
    displayValue: string;
    orderedBoostedList: { displayValue: string; order: number }[];
  },
  action: Action
): MerchandisingRuleSetFacetConfigWithId & {
  displayValue: string;
  orderedBoostedList: { displayValue: string; order: number }[];
} => {
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
            orderedBoostedList: updatedBoosted
              .toSpliced(currentIndex - 1, 0, action.payload.id)
              .map((val, index) => ({
                displayValue: val,
                order: index + 1,
              })),
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
            orderedBoostedList: toArrayWithSwappedElements(
              currentBoosted,
              currentIndex,
              currentIndex + 1
            ).map((val, index) => ({
              displayValue: val,
              order: index + 1,
            })),
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
        orderedBoostedList:
          action.payload.newDisplayType === 'included'
            ? [...currentBoosted, action.payload.id].map((val, index) => ({
                displayValue: val,
                order: index + 1,
              }))
            : currentBoosted
                .filter((val) => val !== action.payload.id)
                .map((val, index) => ({
                  displayValue: val,
                  order: index + 1,
                })),
      };
    }

    case 'SET_BOOSTED_ORDER': {
      // This will only be called if there are boosted items
      const currentBoosted = state.boosted!;
      const currentIndex = currentBoosted.indexOf(action.payload.id);
      const newIndex = action.payload.newIndex;

      const item = currentBoosted[currentIndex];
      const withoutItem = currentBoosted.toSpliced(currentIndex, 1);
      const newBoostedArray = withoutItem.toSpliced(newIndex, 0, item);

      return {
        ...state,
        boosted: newBoostedArray,
        orderedBoostedList: newBoostedArray.map((val, newIndex) => ({
          displayValue: val,
          order: newIndex + 1,
        })),
      };
    }
  }
};
