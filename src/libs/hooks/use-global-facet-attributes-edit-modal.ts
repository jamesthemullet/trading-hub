import type { ActionDispatch } from 'react';
import { useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { useCheckMergeNameUnique } from '@/libs/hooks';
import type {
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

export const useGlobalFacetAttributesEditModal = ({
  facet,
  countryCode,
  displayName,
  dispatch,
  globalAttributesLocalState,
  setIsAwaitingUpdate,
}: {
  facet: MerchandisingReturnedGlobalFacet;
  countryCode?: MerchandisingCountryCode;
  displayName: string;
  dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]>;
  globalAttributesLocalState: GlobalAttributesPageState;
  setIsAwaitingUpdate: (v: boolean) => void;
}): {
  editModalError: string;
  handleEditModalError: (message: string) => void;
  handleEditModalSave: (
    newValue: string,
    demergedValues?: string[]
  ) => Promise<void>;
} => {
  const { checkMergeNameUnique } = useCheckMergeNameUnique();
  const [editModalError, setEditModalError] = useState('');

  const handleEditModalError = (message: string) => {
    setEditModalError(message);
    dispatch({
      type: 'SET_ERROR',
      payload: {
        displayName,
        message,
      },
    });
  };

  const handleEditModalSave = async (
    newValue: string,
    demergedValues: string[] = []
  ) => {
    // istanbul ignore else
    if (!newValue?.trim()) return setEditModalError('You must supply a value');

    setIsAwaitingUpdate(true);

    const isFirstAttributeBoosted =
      globalAttributesLocalState.boostedRows.filter((val) => val.isChecked)
        .length > 0;
    const isFirstAttributeExcluded =
      globalAttributesLocalState.boostedRows.filter((val) => val.isChecked)
        .length === 0 &&
      globalAttributesLocalState.nonBoostedExcludedRows.filter(
        (val) => val.isChecked
      ).length === 0;

    const selectedRows = [
      ...globalAttributesLocalState.boostedRows.filter((val) => val.isChecked),
      ...globalAttributesLocalState.excludedRows.filter((val) => val.isChecked),
      ...globalAttributesLocalState.nonBoostedExcludedRows.filter(
        (val) => val.isChecked
      ),
    ];

    const isExistingMergeGroup = selectedRows.some((row) => {
      return row.isMergeGroup === true;
    });

    const trimmedNewValue = newValue.trim();

    const isInOtherMergeGroups =
      globalAttributesLocalState.merged
        .flatMap((group) =>
          group.mergedValues?.map(
            (val: string) => val.toLowerCase() === trimmedNewValue.toLowerCase()
          )
        )
        .some((val) => !!val) && !isExistingMergeGroup;

    if (isInOtherMergeGroups) {
      handleEditModalError(`${trimmedNewValue} is not a unique value`);
      return;
    }

    const { isUniqueValue, error: uniqueCheckError } =
      await checkMergeNameUnique({
        facetId: facet.id,
        searchQuery: trimmedNewValue,
        countryCode: countryCode ?? 'UK_IE',
        exceptions: selectedRows
          .flatMap((row) => row.attributes)
          .filter((val) => !demergedValues.includes(val)),
        localAttributeValues: [
          ...globalAttributesLocalState.boostedRows.map(
            (row) => row.displayName
          ),
          ...globalAttributesLocalState.excludedRows.map(
            (row) => row.displayName
          ),
          ...globalAttributesLocalState.nonBoostedExcludedRows.map(
            (row) => row.displayName
          ),
          ...demergedValues,
        ],
      });

    if (uniqueCheckError) {
      handleEditModalError(uniqueCheckError);
      setIsAwaitingUpdate(false);
      return;
    }

    if (!isUniqueValue) {
      handleEditModalError(`${trimmedNewValue} is not a unique value`);
      return;
    }

    requestAnimationFrame(() => {
      const remainingMergedValues =
        globalAttributesLocalState.currentMerge.mergedValues.filter(
          (val) => !demergedValues.includes(val)
        );

      if (isExistingMergeGroup) {
        const originalMergeGroup = globalAttributesLocalState.merged.find(
          (merge) =>
            merge.displayValue ===
              globalAttributesLocalState.currentMerge.displayValue ||
            merge.mergedValues?.some((val) =>
              globalAttributesLocalState.currentMerge.mergedValues.includes(val)
            )
        );

        demergedValues.forEach((valueToRemove) => {
          const isInOriginalMergeGroup =
            originalMergeGroup?.mergedValues?.includes(valueToRemove);

          if (isInOriginalMergeGroup) {
            dispatch({
              type: 'REMOVE_FROM_MERGE_GROUP',
              payload: {
                valueToRemove,
                mergeDisplayName:
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  originalMergeGroup?.displayValue ||
                  globalAttributesLocalState.currentMerge.displayValue,
              },
            });
          }
        });

        dispatch({
          type: 'UPDATE_MERGE_GROUP',
          payload: {
            displayValue: trimmedNewValue,
            attributes: remainingMergedValues,
            isFirstAttributeBoosted,
            isFirstAttributeExcluded,
          },
        });
      } else {
        dispatch({
          type: 'CREATE_MERGE_GROUP',
          payload: {
            displayValue: trimmedNewValue,
            attributes: remainingMergedValues,
            isFirstAttributeBoosted,
            isFirstAttributeExcluded,
          },
        });
      }

      dispatch({
        type: 'TOGGLE_ALL_ATTRIBUTES',
        payload: {
          areAllSelected: false,
        },
      });
      dispatch({ type: 'CLOSE_MERGE_GROUP_MODAL' });
    });

    handleEditModalError('');
  };

  return {
    editModalError,
    handleEditModalError,
    handleEditModalSave,
  };
};
