import styled from '@emotion/styled';
import { useMemo, useReducer, useState } from 'react';
import { Modal } from '@mantine/core';

import type { CountryCode, ReturnedGlobalFacet } from '@/libs/api';
import { Button } from '@/libs/components/buttons/button/button';
import { color } from '@/libs/components/utils/constants';
import { spacing } from '@/libs/components/utils/spacing';

import { intersection, without } from 'lodash';

import EditModalFacetContent from './edit-facet-modal-content';
import { facetReducer } from './facet-reducer';

const MODAL_WIDTH = 1150;

const ModalContainer = styled.div`
  height: 100%;
  min-width: 860px;
  display: flex;
  flex-direction: column;
`;

const ModalFooter = styled.div`
  background-color: #fff;
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.grey};
  padding: ${spacing(1)};
  display: flex;
  justify-content: flex-end;
  gap: ${spacing(2)};
  button {
    width: 160px;
  }
`;

const defaultMergedDisplayValue = 'Name your merge';

export const EditFacetModalV2 = ({
  onClose,
  onSave,
  facet,
  mergeEnabled = true,
  removeFacetValueFromMergeGroupEnabled = true,
  saveButtonLabel = 'Save',
  categories,
  countryCode,
  displayValueEditEnabled = true,
}: {
  onClose: () => void;
  onSave: (facet: ReturnedGlobalFacet) => void;
  facet: ReturnedGlobalFacet;
  countryCode: CountryCode;
  mergeEnabled?: boolean;
  removeFacetValueFromMergeGroupEnabled?: boolean;
  displayValueEditEnabled?: boolean;
  saveButtonLabel?: string;
  categories?: string[];
}) => {
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const processedFacet = useMemo(() => {
    const intersectedValues = intersection(facet.boosted, facet.excludedValues);

    const boosted = without(facet.boosted, ...intersectedValues);

    return {
      ...facet,
      ...(boosted.length > 0 && { boosted }),
    };
  }, [facet]);

  const [facetLocalState, dispatch] = useReducer(facetReducer, processedFacet);

  const handleSave = async () => {
    onSave(facetLocalState);
  };

  return (
    <Modal.Root
      opened={true}
      onClose={onClose}
      centered
      size={MODAL_WIDTH}
      padding={0}
      role="dialog"
      aria-modal="true"
      aria-label="Edit facet values modal"
    >
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <ModalContainer>
            <EditModalFacetContent
              facet={facetLocalState}
              categories={categories}
              countryCode={countryCode}
              mergeEnabled={mergeEnabled}
              removeFacetValueFromMergeGroupEnabled={
                removeFacetValueFromMergeGroupEnabled
              }
              displayValueEditEnabled={displayValueEditEnabled}
              defaultMergedDisplayValue={defaultMergedDisplayValue}
              dispatch={dispatch}
              handleDisableSaveButton={setIsSaveDisabled}
            />
          </ModalContainer>
        </Modal.Body>

        <ModalFooter>
          <Button onClick={onClose} aria-label="Close attributes modal">
            Cancel
          </Button>{' '}
          <Button
            onClick={handleSave}
            isDisabled={isSaveDisabled}
            aria-label="Save changes to attributes"
          >
            {saveButtonLabel}
          </Button>
        </ModalFooter>
      </Modal.Content>
    </Modal.Root>
  );
};
