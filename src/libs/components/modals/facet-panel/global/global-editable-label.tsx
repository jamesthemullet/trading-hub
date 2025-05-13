import type {
  MerchandisingCountryCode,
  MerchandisingGlobalOnlyFacetConfig,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';

import { FlexColumnCol } from '../search-and-category/edit-facet-modal-content.styles';

type MergeGroup = MerchandisingGlobalOnlyFacetConfig['merged'];

export const GlobalEditableLabel = ({
  displayName,
  errorStates,
  editingValues,
  facet,
  countryCode,
  merged,
  setError,
  setMerged,
  setEditingValues,
}: {
  displayName: string;
  errorStates: Record<string, { message: string }>;
  editingValues: string[];

  facet: MerchandisingReturnedGlobalFacet;
  countryCode: MerchandisingCountryCode;
  merged: MergeGroup | undefined;
  setError: (displayName: string, message: string) => void;
  setMerged: (value: MergeGroup | undefined) => void;
  setEditingValues: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const { checkMergeNameUnique } = useCheckMergeNameUnique();
  const errorState = errorStates[displayName] || {
    message: '',
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
      setError(oldValue, `${trimmedNewValue} is not a unique value`);
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
      setError(oldValue, `${trimmedNewValue} is not a unique value`);
      return;
    }

    if (existingMergeGroup > -1) {
      setMerged([
        ...merged!.map((group, index) =>
          index === existingMergeGroup
            ? { ...group, displayValue: newValue }
            : group
        ),
      ]);
    } else {
      setMerged([
        ...merged!,
        { displayValue: newValue, mergedValues: [oldValue] },
      ]);
    }

    setError(oldValue, '');
  };

  return (
    <FlexColumnCol>
      <EditableLabel
        displayValue={displayName}
        onCancel={() => setError(displayName, '')}
        onDisplayValueChange={(newValue) => {
          handleDisplayNameChange(displayName, newValue);
          setEditingValues((prev) => prev.filter((val) => val !== displayName));
        }}
        canCancelEdit
        showErrorState={!!errorStates[displayName]?.message}
        showEditState={editingValues.includes(displayName)}
        setError={(message) => setError(displayName, message)}
        disallowedErrorMessage={errorState.message}
        handleUpdatedValue={(event) => {
          event.stopPropagation();
          if (event.target.value === '') {
            setError(displayName, 'You must supply a value');
          } else {
            setError(displayName, '');
          }
        }}
      />
    </FlexColumnCol>
  );
};
