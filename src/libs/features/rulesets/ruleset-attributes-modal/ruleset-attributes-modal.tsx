import type { Dispatch } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingAlphanumericBoostBury,
  MerchandisingCountryCode,
  MerchandisingIncludeExclude,
  MerchandisingNumericBoostBury,
} from '@/libs/api';
import type {
  AttributeEdit,
  RuleSetActions,
  RulesetAttribute,
} from '@/libs/components/types';

import { AddSetAttribute } from '../add-set-attribute/add-set-attribute';

const MODAL_WIDTH = 435;

interface RulesetAttributesModalProps {
  isModalOpen: boolean;
  countryCode: MerchandisingCountryCode;
  categories?: string[];
  searchTerms?: string[];
  editData: AttributeEdit | null;
  onCloseModal: () => void;
  dispatch: Dispatch<RuleSetActions>;
}
export const RulesetAttributesModal = ({
  isModalOpen,
  categories,
  countryCode,
  searchTerms,
  editData,
  onCloseModal,
  dispatch,
}: RulesetAttributesModalProps) => {
  const handleSave = (attribute: RulesetAttribute) => {
    if (attribute.change === 'modify' && editData) {
      if (
        attribute.type === 'alphanumeric' &&
        (attribute.operation === 'boost' || attribute.operation === 'bury')
      ) {
        if (attribute.operation === editData.operation) {
          const data =
            attribute.attribute as MerchandisingAlphanumericBoostBury;
          dispatch({
            type: 'alphanumericBoostBuryAttribute',
            payload: {
              change: 'modify',
              index: editData.index,
              data,
              operation: attribute.operation,
            },
          });
        } else {
          const data =
            attribute.attribute as MerchandisingAlphanumericBoostBury;
          dispatch({
            type: 'alphanumericBoostBuryAttribute',
            payload: {
              change: 'add',
              index: 0,
              data,
              operation: attribute.operation,
            },
          });
          if (editData.operation === 'boost' || editData.operation === 'bury') {
            dispatch({
              type: 'alphanumericBoostBuryAttribute',
              payload: {
                change: 'remove',
                index: editData.index,
                operation: editData.operation,
                data: {
                  fields: [],
                  weight: 0,
                },
              },
            });
          } else {
            dispatch({
              type: 'alphanumericIncludeExcludeAttribute',
              payload: {
                change: 'remove',
                index: editData.index,
                operation: editData.operation,
                data: {
                  fields: [],
                },
              },
            });
          }
        }
      }
      if (
        attribute.type === 'alphanumeric' &&
        (attribute.operation === 'include' || attribute.operation === 'exclude')
      ) {
        if (attribute.operation === editData.operation) {
          const data = attribute.attribute as MerchandisingIncludeExclude;
          dispatch({
            type: 'alphanumericIncludeExcludeAttribute',
            payload: {
              change: 'modify',
              index: editData.index,
              data: {
                fields: data.fields,
              },
              operation: attribute.operation,
            },
          });
        } else {
          const data = attribute.attribute as MerchandisingIncludeExclude;
          dispatch({
            type: 'alphanumericIncludeExcludeAttribute',
            payload: {
              change: 'add',
              index: 0,
              data: {
                fields: data.fields,
              },
              operation: attribute.operation,
            },
          });
          if (editData.operation === 'boost' || editData.operation === 'bury') {
            dispatch({
              type: 'alphanumericBoostBuryAttribute',
              payload: {
                change: 'remove',
                index: editData.index,
                operation: editData.operation,
                data: {
                  fields: [],
                  weight: 0,
                },
              },
            });
          } else {
            dispatch({
              type: 'alphanumericIncludeExcludeAttribute',
              payload: {
                change: 'remove',
                index: editData.index,
                operation: editData.operation,
                data: {
                  fields: [],
                },
              },
            });
          }
        }
      }
      if (
        attribute.type === 'numeric' &&
        (attribute.operation === 'boost' || attribute.operation === 'bury')
      ) {
        if (attribute.operation === editData.operation) {
          const data = attribute.attribute as MerchandisingNumericBoostBury;
          dispatch({
            type: 'numericAttribute',
            payload: {
              change: 'modify',
              index: editData.index,
              data,
              operation: attribute.operation,
            },
          });
        } else {
          const data = attribute.attribute as MerchandisingNumericBoostBury;
          dispatch({
            type: 'numericAttribute',
            payload: {
              change: 'add',
              index: 0,
              data,
              operation: attribute.operation,
            },
          });
          dispatch({
            type: 'numericAttribute',
            payload: {
              change: 'remove',
              index: editData.index,
              operation: editData.operation as 'boost' | 'bury',
              data: {
                field: '',
                weight: 0,
              },
            },
          });
        }
      }
    } else {
      if (
        attribute.type === 'numeric' &&
        (attribute.operation === 'boost' || attribute.operation === 'bury')
      ) {
        const data = attribute.attribute as MerchandisingNumericBoostBury;
        dispatch({
          type: 'numericAttribute',
          payload: {
            change: 'add',
            index: 0,
            data,
            operation: attribute.operation,
          },
        });
      }

      if (
        attribute.type === 'alphanumeric' &&
        (attribute.operation === 'boost' || attribute.operation === 'bury')
      ) {
        const data = attribute.attribute as MerchandisingAlphanumericBoostBury;
        dispatch({
          type: 'alphanumericBoostBuryAttribute',
          payload: {
            change: 'add',
            index: 0,
            data,
            operation: attribute.operation,
          },
        });
      }

      if (
        attribute.type === 'alphanumeric' &&
        (attribute.operation === 'include' || attribute.operation === 'exclude')
      ) {
        const data = attribute.attribute as MerchandisingIncludeExclude;
        dispatch({
          type: 'alphanumericIncludeExcludeAttribute',
          payload: {
            change: 'add',
            index: 0,
            data: {
              fields: data.fields,
            },
            operation: attribute.operation,
          },
        });
      }
    }

    onCloseModal();
  };

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
      <Modal.Content>
        <Modal.Body>
          <AddSetAttribute
            categories={categories}
            countryCode={countryCode}
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
