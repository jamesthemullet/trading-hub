import {
  type ChangeEvent,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { ROUTES } from '@/libs/constants';
import { FacetAttributesListActions } from '@/libs/containers';
import { GlobalFacetAttributesEditModal } from '@/libs/containers/facets/global-facet-attributes-edit-modal';
import ConfirmationModal from '@/libs/containers/shared/modals/confirmation-modal/confirmation-modal';
import { useGlobalFacetUpdate } from '@/libs/hooks';
import { useGlobalFacetAttributesEditModal } from '@/libs/hooks/use-global-facet-attributes-edit-modal';
import { globalAttributesPageReducer } from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';
import { useCheckedRowsSelector } from '@/libs/stores/global-attributes-page/use-checked-rows-selector';

import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';
import { GlobalFacetAttributesList } from '../global-facet-attributes-list/global-facet-attributes-list';

type PageLayout = {
  facet: MerchandisingReturnedGlobalFacet;
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  facetId: string;
  displayName: string;
  ruleSetId: string;
  countryCode: MerchandisingCountryCode | undefined;
  searchQuery: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const GlobalFacetAttributesPageLayout = ({
  facet,
  attributeValues,
  facetId,
  displayName,
  ruleSetId,
  countryCode = 'UK_IE',
  searchQuery,
  onSearchChange,
}: PageLayout) => {
  const router = useRouter();

  const titleId = useId();
  const descriptionId = useId();

  // reducer
  const [globalAttributesLocalState, dispatch] = useReducer(
    globalAttributesPageReducer,
    {
      boostedRows: [],
      excludedRows: [],
      nonBoostedExcludedRows: [],
      merged: [],
      errorStates: {},
      currentMerge: {
        isOpen: false,
        displayValue: '',
        mergedValues: [],
      },
    }
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
      payload: {
        boostedValues:
          facet.boosted?.map((value) => ({ displayValue: value })) || [],
        excludedValues:
          facet.excludedValues?.map((value) => ({ displayValue: value })) || [],
        nonBoostedExcludedValues: attributeValues.filter(
          ({ displayValue }) =>
            !facet.boosted?.includes(displayValue) &&
            !facet.excludedValues?.includes(displayValue)
        ),
        merged:
          facet.merged ||
          // istanbul ignore next
          [],
      },
    });
  }, [facet, attributeValues]);

  // save logic
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // istanbul ignore next
  const onCloseModal = () => setIsConfirmationModalOpen(false);

  const handleSave = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setIsConfirmationModalOpen(false);
    await onSave();
  };

  const { handleGlobalFacetUpdate, error: updateGlobalFacetError } =
    useGlobalFacetUpdate();

  const onSave = async () => {
    const response = await handleGlobalFacetUpdate({
      facetId: facetId,
      data: {
        ...facet,
        merged: globalAttributesLocalState.merged,
        // TODO update logic for included and excluded values
        // istanbul ignore next
        excludedValues: globalAttributesLocalState.excludedRows.flatMap(
          // istanbul ignore next
          (val) => val.displayName
        ),
        // istanbul ignore next
        boosted: globalAttributesLocalState.boostedRows.flatMap(
          // istanbul ignore next
          (val) => val.displayName
        ),
      },
    });

    // istanbul ignore next
    if ('status' in response && response.status === 'error') {
      return;
    }
  };

  // edit modal logic
  const [editingValues, setEditingValues] = useState<string[]>([]);

  const { editModalError, handleEditModalError, handleEditModalSave } =
    useGlobalFacetAttributesEditModal({
      facet,
      countryCode,
      displayName,
      dispatch,
      globalAttributesLocalState,
      setIsAwaitingUpdate,
    });

  // merge logic
  const handleMerge = () => {
    setIsAwaitingUpdate(true);

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

  // render
  const includedValues = useMemo(
    () => globalAttributesLocalState.boostedRows.length,
    [globalAttributesLocalState.boostedRows]
  );

  const excludedValues = useMemo(
    () => globalAttributesLocalState.excludedRows.length,
    [globalAttributesLocalState.excludedRows]
  );

  return (
    <>
      <FacetAttributesPageLayoutHeader
        algoControlValues={
          attributeValues.length - includedValues - excludedValues
        }
        includedValues={includedValues}
        excludedValues={excludedValues}
        displayName={displayName}
        facetType="global"
        isSaveDisabled={false}
        onClose={() => {
          router.push(ROUTES.GLOBAL.FACETS.EDIT(ruleSetId));
        }}
        onSave={handleSave}
        error={updateGlobalFacetError}
      />

      <FacetAttributesListActions
        onSearchChange={onSearchChange}
        isMergeDisabled={checkedRows.length < 2}
        onMergeClick={handleMerge}
      />

      <GlobalFacetAttributesList
        attributeValues={attributeValues}
        searchQuery={searchQuery}
        countryCode={countryCode}
        editingValues={editingValues}
        dispatch={dispatch}
        globalAttributesLocalState={globalAttributesLocalState}
        setEditingValues={setEditingValues}
        facet={facet}
        isAwaitingUpdate={isAwaitingUpdate}
        setIsAwaitingUpdate={setIsAwaitingUpdate}
        writeEnabled
      />

      <Modal.Root
        centered
        opened={isConfirmationModalOpen}
        onClose={onCloseModal}
        padding={10}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <ConfirmationModal
            onCloseModal={onCloseModal}
            handleModalConfirm={handleModalConfirm}
            titleId={titleId}
            descriptionId={descriptionId}
          />
        </Modal.Content>
      </Modal.Root>

      {globalAttributesLocalState.currentMerge.isOpen && (
        <GlobalFacetAttributesEditModal
          globalAttributesLocalState={globalAttributesLocalState}
          dispatch={dispatch}
          error={editModalError}
          handleError={handleEditModalError}
          onSave={handleEditModalSave}
        />
      )}
    </>
  );
};
