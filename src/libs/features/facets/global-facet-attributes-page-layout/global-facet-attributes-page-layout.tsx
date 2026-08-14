import type { ChangeEvent, ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { RulesetDiffModal } from '@/libs/components/ruleset-diff-modal/ruleset-diff-modal';
import { ROUTES } from '@/libs/constants';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetAttributesListActions } from '@/libs/containers';
import { GlobalFacetAttributesEditModal } from '@/libs/containers/facets/global-facet-attributes-edit-modal/global-facet-attributes-edit-modal';
import { ModalUnsavedChanges } from '@/libs/containers/shared/modals';
import { useGlobalFacetUpdate } from '@/libs/hooks';
import { useGlobalFacetAttributesDiff } from '@/libs/hooks/use-global-facet-attributes-diff';
import { useGlobalFacetAttributesEditModal } from '@/libs/hooks/use-global-facet-attributes-edit-modal';
import {
  globalAttributesPageReducer,
  INITIAL_STATE,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';
import { useCheckedRowsSelector } from '@/libs/stores/global-attributes-page/use-checked-rows-selector';

import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';
import { GlobalFacetAttributesList } from '../global-facet-attributes-list/global-facet-attributes-list';
import styles from './global-facet-attributes-page-layout.module.css';

const buildInitialPayload = (
  facet: MerchandisingReturnedGlobalFacet,
  attributeValues: MerchandisingAttributeValuesResponse['values']
) => ({
  boostedValues:
    facet?.boosted?.map((value) => ({ displayValue: value })) || [],
  excludedValues:
    facet?.excludedValues?.map((value) => ({ displayValue: value })) || [],
  nonBoostedExcludedValues: attributeValues.filter(
    ({ displayValue }) =>
      !facet?.boosted?.includes(displayValue) &&
      !facet?.excludedValues?.includes(displayValue)
  ),
  merged:
    facet?.merged ||
    // istanbul ignore next
    [],
});

type PageLayout = {
  facet: MerchandisingReturnedGlobalFacet;
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  searchedAttributeValues?: MerchandisingAttributeValuesResponse['values'];
  facetId: string;
  displayName: string;
  countryCode: MerchandisingCountryCode | undefined;
  searchQuery: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isWriteEnabled: boolean;
};

export const GlobalFacetAttributesPageLayout = ({
  facet,
  attributeValues,
  searchedAttributeValues = [],
  facetId,
  displayName,
  countryCode = 'UK_IE',
  searchQuery,
  onSearchChange,
  isWriteEnabled,
}: PageLayout): ReactElement => {
  const router = useRouter();

  const [isPinned, setIsPinned] = useState(false);

  // reducer
  const [globalAttributesLocalState, dispatch] = useReducer(
    globalAttributesPageReducer,
    INITIAL_STATE,
    (initialState) =>
      globalAttributesPageReducer(initialState, {
        type: 'INITIALISE_STATE',
        payload: buildInitialPayload(facet, attributeValues),
      })
  );
  const checkedRows = useCheckedRowsSelector(globalAttributesLocalState);

  // loading logic
  const [isAwaitingUpdate, setIsAwaitingUpdate] = useState(false);
  useEffect(() => {
    if (!isAwaitingUpdate) return;

    setTimeout(() => {
      setIsAwaitingUpdate(false);
    }, 100);
  }, [isAwaitingUpdate]);

  // init logic
  useEffect(() => {
    dispatch({
      type: 'INITIALISE_STATE',
      payload: buildInitialPayload(facet, attributeValues),
    });
  }, [facet, attributeValues]);

  // Snapshot of the facet's pre-edit state, used to build the review diff.
  const originalState = useMemo(
    () =>
      globalAttributesPageReducer(INITIAL_STATE, {
        type: 'INITIALISE_STATE',
        payload: buildInitialPayload(facet, attributeValues),
      }),
    [facet, attributeValues]
  );

  const diffItems = useGlobalFacetAttributesDiff(
    originalState,
    globalAttributesLocalState
  );

  useEffect(() => {
    if (!searchQuery.trim() || searchedAttributeValues.length === 0) {
      return;
    }

    dispatch({
      type: 'ADD_NONBOOSTEDEXCLUDED_VALUES',
      payload: {
        values: searchedAttributeValues,
      },
    });
  }, [searchQuery, searchedAttributeValues]);

  // save logic
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const navigateBack = useCallback(() => {
    router.push(ROUTES.GLOBAL.FACET_CONFIG);
  }, [router]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setIsUnsavedChangesModalOpen(true);
      return;
    }
    navigateBack();
  }, [hasChanges, navigateBack]);

  const trackingDispatch: typeof dispatch = useCallback((action) => {
    if (
      action.type !== 'TOGGLE_ALL_ATTRIBUTES' &&
      action.type !== 'TOGGLE_SELECTED_ATTRIBUTE'
    ) {
      setHasChanges(true);
    }
    dispatch(action);
  }, []);

  const handleSave = () => {
    setIsReviewModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsReviewModalOpen(false);
    await onSave();
  };

  const { handleGlobalFacetUpdate, error: updateGlobalFacetError } =
    useGlobalFacetUpdate();

  const onSave = async () => {
    const response = await handleGlobalFacetUpdate({
      facetId,
      data: {
        ...facet,
        merged: globalAttributesLocalState.merged,
        // TODO update logic for included and excluded values
        excludedValues: globalAttributesLocalState.excludedRows.flatMap(
          (val) => val.displayName
        ),
        boosted: globalAttributesLocalState.boostedRows.flatMap(
          (val) => val.displayName
        ),
      },
    });

    if ('status' in response && response.status === 'error') {
      return;
    }

    router.push(ROUTES.GLOBAL.FACET_CONFIG);
  };

  // edit modal logic
  const [editingValues, setEditingValues] = useState<string[]>([]);

  const { editModalError, handleEditModalError, handleEditModalSave } =
    useGlobalFacetAttributesEditModal({
      facet,
      countryCode,
      displayName,
      dispatch: trackingDispatch,
      globalAttributesLocalState,
      setIsAwaitingUpdate,
    });

  // merge logic
  const handleMerge = () => {
    setIsAwaitingUpdate(true);
    setHasChanges(true);

    const selectedRows = [
      ...globalAttributesLocalState.boostedRows.filter(
        (val) =>
          // istanbul ignore next
          val.isChecked
      ),
      ...globalAttributesLocalState.excludedRows.filter(
        (val) =>
          // istanbul ignore next
          val.isChecked
      ),
      ...globalAttributesLocalState.nonBoostedExcludedRows.filter(
        (val) => val.isChecked
      ),
    ];

    dispatch({
      type: 'OPEN_MERGE_GROUP_MODAL',
      payload: {
        displayValue: selectedRows[0].displayName,
        mergedValues: selectedRows.flatMap((row) => row.attributes),
      },
    });
    handleEditModalError('');
  };

  return (
    <>
      <div className={isPinned ? styles.stickyContainer : undefined}>
        <FacetAttributesPageLayoutHeader
          displayName={displayName}
          facetType={FacetType.Global}
          onClose={handleClose}
          onSave={handleSave}
          error={updateGlobalFacetError}
          isWriteEnabled={isWriteEnabled}
          countryCode={countryCode}
          lastChanged={facet?.lastChanged}
        />

        <FacetAttributesListActions
          onSearchChange={onSearchChange}
          isMergeDisabled={checkedRows.length < 2}
          onMergeClick={handleMerge}
          isWriteEnabled={isWriteEnabled}
          checkedRows={checkedRows.length}
          shouldShowPinButton
          isPinned={isPinned}
          onTogglePin={() => setIsPinned((prev) => !prev)}
        />
      </div>

      <GlobalFacetAttributesList
        attributeValues={attributeValues}
        searchedResultsCount={searchedAttributeValues.length}
        searchQuery={searchQuery}
        countryCode={countryCode}
        editingValues={editingValues}
        dispatch={trackingDispatch}
        globalAttributesLocalState={globalAttributesLocalState}
        setEditingValues={setEditingValues}
        facet={facet}
        isAwaitingUpdate={isAwaitingUpdate}
        setIsAwaitingUpdate={setIsAwaitingUpdate}
        isWriteEnabled={isWriteEnabled}
      />

      <RulesetDiffModal
        isOpen={isReviewModalOpen}
        diffItems={diffItems}
        onConfirm={handleConfirmSave}
        onCancel={() => setIsReviewModalOpen(false)}
        shouldShowGlobalWarning
      />

      {globalAttributesLocalState.currentMerge.isOpen && (
        <GlobalFacetAttributesEditModal
          globalAttributesLocalState={globalAttributesLocalState}
          dispatch={trackingDispatch}
          error={editModalError}
          handleError={handleEditModalError}
          onSave={handleEditModalSave}
        />
      )}

      <ModalUnsavedChanges
        isOpen={isUnsavedChangesModalOpen}
        onClose={navigateBack}
        onContinue={() => setIsUnsavedChangesModalOpen(false)}
      />
    </>
  );
};
