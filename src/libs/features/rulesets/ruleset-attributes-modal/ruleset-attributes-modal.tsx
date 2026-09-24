import type { Dispatch, ReactElement } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingCountryCode,
  SearchMerchandisingProductsV1ParamsEnum,
} from '@/libs/api';
import type { AttributeEdit, RuleSetActions } from '@/libs/components/types';

import { AddSetAttribute } from '../add-set-attribute/add-set-attribute';
import { useRulesetAttributeSave } from './use-ruleset-attribute-save';

const MODAL_WIDTH = 435;

type RulesetAttributesModalProps = {
  isModalOpen: boolean;
  countryCode: MerchandisingCountryCode;
  catalogue?: SearchMerchandisingProductsV1ParamsEnum;
  categories?: string[];
  searchTerms?: string[];
  editData: AttributeEdit | null;
  onCloseModal: () => void;
  dispatch: Dispatch<RuleSetActions>;
};
export const RulesetAttributesModal = ({
  isModalOpen,
  categories,
  countryCode,
  catalogue,
  searchTerms,
  editData,
  onCloseModal,
  dispatch,
}: RulesetAttributesModalProps): ReactElement => {
  const handleSave = useRulesetAttributeSave({
    dispatch,
    editData,
    onCloseModal,
  });

  return (
    <Modal.Root
      opened={isModalOpen}
      onClose={
        // istanbul ignore next
        () => onCloseModal()
      }
      centered
      size={`${2 * MODAL_WIDTH}px`}
      padding={0}
      role="dialog"
      aria-modal="true"
      aria-label="Add attribute modal"
    >
      <Modal.Overlay blur={3} />
      <Modal.Content aria-label="Add attribute modal">
        <Modal.Body>
          <AddSetAttribute
            categories={categories}
            countryCode={countryCode}
            catalogue={catalogue}
            searchTerms={searchTerms}
            onCancel={onCloseModal}
            onSelect={handleSave}
            isEditMode={editData !== null}
            editData={editData}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
