import { type Dispatch, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingGlobalOnlyFacetConfig,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';

import { FlexColumnCol } from '../search-and-category/edit-facet-modal-content.styles';
import type {
  FormattedRow,
  GlobalAttributeReducer,
} from './global-attribute-reducer';

type MergeGroup = MerchandisingGlobalOnlyFacetConfig['merged'];

export const GlobalEditableLabel = ({
  displayName,
  editingValues,
  facet,
  boostedRows,
  excludedRows,
  countryCode,
  merged,
  dispatch,
  setEditingValues,
}: {
  displayName: string;
  editingValues: string[];
  facet: MerchandisingReturnedGlobalFacet;
  boostedRows: FormattedRow[];
  excludedRows: FormattedRow[];
  countryCode: MerchandisingCountryCode;
  merged: MergeGroup | undefined;
  dispatch: Dispatch<GlobalAttributeReducer>;
  setEditingValues: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [error, setError] = useState<string>('');
  const allBoostedValues = boostedRows.map((row) => row.displayName);
  const allExcludedValues = excludedRows.map((row) => row.displayName);
  const { checkMergeNameUnique } = useCheckMergeNameUnique();

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
      .map((group) =>
        group.mergedValues?.map(
          (val) => val.toLowerCase() === trimmedNewValue.toLowerCase()
        )
      )
      .flat()
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
          isFirstAttributeBoosted: allBoostedValues?.includes(oldValue),
          isFirstAttributeExcluded: allExcludedValues?.includes(oldValue),
        },
      });
    }

    handleError('');
  };

  return (
    <FlexColumnCol>
      <EditableLabel
        displayValue={displayName}
        onCancel={() => handleError('')}
        onDisplayValueChange={(newValue) => {
          handleDisplayNameChange(displayName, newValue);
          setEditingValues((prev) => prev.filter((val) => val !== displayName));
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
      />
    </FlexColumnCol>
  );
};
