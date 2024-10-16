import { ReturnedGlobalFacet } from '@/libs/api';

import { AttributeDisplayType } from './types';
import { toArrayWithSwappedElements } from './utils/swap-array-elements';

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

type RenameDisplayValueAction = {
  type: 'RENAME_DISPLAY_VALUE';
  payload: {
    id: string;
    newDisplayValue: string;
  };
};

type MergeSelectedFacetAttributeValuesAction = {
  type: 'MERGE_SELECTED_ATTRIBUTE_VALUES';
  payload: {
    selectedFacetAttributeValues: string[];
    displayValue: string;
  };
};

type RemoveMergedValueAction = {
  type: 'REMOVE_MERGED_VALUE';
  payload: {
    mergeGroupDisplayName: string;
    attributeToRemove: string;
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
  | RenameDisplayValueAction
  | MergeSelectedFacetAttributeValuesAction
  | RemoveMergedValueAction
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
    case 'RENAME_DISPLAY_VALUE': {
      const mergedIndex = (state.merged ?? []).findIndex((merge) => {
        const isInMergedValues = merge.mergedValues?.some(
          (mergeValue) => mergeValue === action.payload.id
        );
        return isInMergedValues;
      });
      const currentMerged = state.merged ?? [];
      return {
        ...state,
        merged:
          mergedIndex !== -1
            ? currentMerged.map((merge, index) => {
                if (index === mergedIndex) {
                  return {
                    ...merge,
                    displayValue: action.payload.newDisplayValue,
                  };
                }
                return merge;
              })
            : [
                ...currentMerged,
                {
                  displayValue: action.payload.newDisplayValue,
                  mergedValues: [action.payload.id],
                },
              ],
      };
    }
    case 'MERGE_SELECTED_ATTRIBUTE_VALUES': {
      const currentMerged = state.merged ?? [];
      const currentBoosted = state.boosted ?? [];
      const currentExcludedValues = state.excludedValues ?? [];

      const mergedToRemove: string[] = [];
      const result: string[] = [];

      const isFirstAttributeBoosted = state.boosted?.includes(
        action.payload.selectedFacetAttributeValues[0]
      );
      const isFirstAttributeExcluded = state.excludedValues?.includes(
        action.payload.selectedFacetAttributeValues[0]
      );

      action.payload.selectedFacetAttributeValues.forEach((selectedValue) => {
        const merged = currentMerged.find(
          (merge) => merge.displayValue === selectedValue
        );
        if (merged) {
          // eslint-disable-next-line functional/immutable-data
          mergedToRemove.push(selectedValue);

          merged.mergedValues?.forEach((mergedValue) => {
            // eslint-disable-next-line functional/immutable-data
            result.push(mergedValue);
          });
        } else {
          // eslint-disable-next-line functional/immutable-data
          result.push(selectedValue);
        }
      });
      const mergeWithoutRemoved = currentMerged.filter(
        (merge) => !mergedToRemove.includes(merge.displayValue ?? '')
      );
      return {
        ...state,
        boosted: isFirstAttributeBoosted
          ? [...new Set([...currentBoosted, ...result])]
          : state.boosted,
        excludedValues: isFirstAttributeExcluded
          ? [...new Set([...currentExcludedValues, ...result])]
          : state.excludedValues,
        merged: [
          ...mergeWithoutRemoved,
          {
            displayValue: action.payload.displayValue,
            mergedValues: result,
          },
        ],
      };
    }
    case 'REMOVE_MERGED_VALUE': {
      return {
        ...state,
        boosted: state.boosted?.filter(
          (boostedValue) => boostedValue !== action.payload.attributeToRemove
        ),
        excludedValues: state.excludedValues?.filter(
          (excludedValue) => excludedValue !== action.payload.attributeToRemove
        ),
        merged: state.merged?.map((merge) => {
          if (merge.displayValue === action.payload.mergeGroupDisplayName) {
            return {
              ...merge,
              mergedValues: merge.mergedValues?.filter(
                (value) => value !== action.payload.attributeToRemove
              ),
            };
          }
          return merge;
        }),
      };
    }
    case 'CHANGE_DISPLAY_TYPE': {
      const currentBoosted = state.boosted ?? [];
      const currentExcludedValues = state.excludedValues ?? [];
      const currentMerged = state.merged ?? [];

      const group = currentMerged.find((merge) =>
        merge.mergedValues?.includes(action.payload.id)
      );

      if (group && group.mergedValues) {
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
