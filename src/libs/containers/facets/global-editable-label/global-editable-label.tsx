import { type Dispatch, useEffect, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingGlobalOnlyFacetConfig,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { Loader } from '@/libs/components/loader/loader';
import { EditableLabel } from '@/libs/containers/shared/editable-label/editable-label';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';
import type {
  FormattedRow,
  GlobalAttributesPageReducer,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

type MergeGroup = MerchandisingGlobalOnlyFacetConfig['merged'];

export const GlobalEditableLabel = ({
  displayName,
  editingValues,
  facet,
  boostedRows,
  nonBoostedExcludedRows,
  excludedRows,
  countryCode,
  merged,
  dispatch,
  setEditingValues,
  writeEnabled,
}: {
  displayName: string;
  editingValues: string[];
  facet: MerchandisingReturnedGlobalFacet;
  boostedRows: FormattedRow[];
  nonBoostedExcludedRows: FormattedRow[];
  excludedRows: FormattedRow[];
  countryCode: MerchandisingCountryCode;
  merged: MergeGroup | undefined;
  dispatch: Dispatch<GlobalAttributesPageReducer>;
  setEditingValues: React.Dispatch<React.SetStateAction<string[]>>;
  writeEnabled: boolean;
}) => {
  const [error, setError] = useState<string>('');
  const allBoostedValues = boostedRows.map((row) => row.displayName);
  const allExcludedValues = excludedRows.map((row) => row.displayName);
  const { checkMergeNameUnique } = useCheckMergeNameUnique();
  const [isAwaitingUpdate, setIsAwaitingUpdate] = useState(false);

  useEffect(() => {
    if (!isAwaitingUpdate) return;

    setIsAwaitingUpdate(false);
  }, [isAwaitingUpdate]);

  const handleError = (message: string) => {
    setError(message);
    dispatch({
      type: 'SET_ERROR',
      payload: {
        displayName,
        message,
      },
    });
  };

  const handleDisplayNameChange = async (
    oldValue: string,
    newValue: string
  ) => {
    if (oldValue === newValue) return;

    const trimmedNewValue = newValue.trim();

    const existingMergeGroup = merged!.findIndex(
      (val) => val.displayValue === oldValue
    );

    const otherMergeGroups = merged!.toSpliced(existingMergeGroup);

    const isInOtherMergeGroups = otherMergeGroups
      .flatMap((group) =>
        group.mergedValues?.map(
          (val) => val.toLowerCase() === trimmedNewValue.toLowerCase()
        )
      )
      .some((val) => !!val);

    if (isInOtherMergeGroups) {
      handleError(`${trimmedNewValue} is not a unique value`);
      return;
    }

    const { isUniqueValue } = await checkMergeNameUnique({
      facetId: facet.id,
      searchQuery: trimmedNewValue,
      countryCode,
      exceptions:
        existingMergeGroup > -1
          ? merged![existingMergeGroup].mergedValues
          : undefined,
      localAttributeValues: [
        ...boostedRows.map((row) => row.displayName),
        ...excludedRows.map((row) => row.displayName),
        ...nonBoostedExcludedRows.map((row) => row.displayName),
      ],
    });

    if (!isUniqueValue) {
      handleError(`${trimmedNewValue} is not a unique value`);
      return;
    }

    dispatch({
      type: 'AMEND_DISPLAY_NAME',
      payload: { oldValue: displayName, newValue },
    });

    if (existingMergeGroup === -1) {
      dispatch({
        type: 'CREATE_MERGE_GROUP',
        payload: {
          attributes: [newValue],
          displayValue: newValue,
          isFirstAttributeBoosted: allBoostedValues?.includes(oldValue),
          isFirstAttributeExcluded: allExcludedValues?.includes(oldValue),
        },
      });
    }

    handleError('');
  };

  return (
    <div className={styles.tableCol}>
      <EditableLabel
        displayValue={displayName}
        onCancel={() => handleError('')}
        onDisplayValueChange={(newValue) => {
          setIsAwaitingUpdate(true);
          requestAnimationFrame(() => {
            handleDisplayNameChange(displayName, newValue);
            setEditingValues((prev) =>
              prev.filter((val) => val !== displayName)
            );
          });
        }}
        canCancelEdit
        showErrorState={!!error}
        showEditState={editingValues.includes(displayName)}
        setError={(message) => handleError(message)}
        disallowedErrorMessage={error}
        handleUpdatedValue={(event) => {
          event.stopPropagation();

          if (event.target.value === '') {
            handleError('You must supply a value');
          }

          if (error && event.target.value !== '') {
            handleError('');
          }
        }}
        writeEnabled={writeEnabled}
      />
      {isAwaitingUpdate && <Loader isInModal />}
    </div>
  );
};
