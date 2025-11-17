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
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { ROUTES } from '@/libs/constants';
import { FacetAttributesListActions } from '@/libs/containers';
import ConfirmationModal from '@/libs/containers/shared/modals/confirmation-modal/confirmation-modal';
import { useGlobalFacetUpdate } from '@/libs/hooks';
import { globalAttributesReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';

import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';
import { GlobalFacetAttributesList } from '../global-facet-attributes-list/global-facet-attributes-list';

type PageLayout = {
  facet: MerchandisingReturnedGlobalFacet;
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  facetId: string;
  displayName: string;
  ruleSetId: string;
  searchQuery: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const GlobalFacetAttributesPageLayout = ({
  facet,
  attributeValues,
  facetId,
  displayName,
  ruleSetId,
  searchQuery,
  onSearchChange,
}: PageLayout) => {
  const router = useRouter();

  const titleId = useId();
  const descriptionId = useId();

  const [editingValues, setEditingValues] = useState<string[]>([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [globalAttributesLocalState, dispatch] = useReducer(
    globalAttributesReducer,
    {
      boostedRows: [],
      excludedRows: [],
      nonBoostedExcludedRows: [],
      merged: [],
      errorStates: {},
    }
  );

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

  const handleSave = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setIsConfirmationModalOpen(false);
    await onSave();
  };

  // istanbul ignore next
  const onCloseModal = () => setIsConfirmationModalOpen(false);

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

      <FacetAttributesListActions onSearchChange={onSearchChange} />

      <GlobalFacetAttributesList
        attributeValues={attributeValues}
        searchQuery={searchQuery}
        countryCode="UK_IE"
        editingValues={editingValues}
        dispatch={dispatch}
        globalAttributesLocalState={globalAttributesLocalState}
        writeEnabled
        setEditingValues={setEditingValues}
        facet={facet}
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
    </>
  );
};
