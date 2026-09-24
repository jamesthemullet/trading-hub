import type { Dispatch } from 'react';
import { useCallback } from 'react';

import type {
  MerchandisingAlphanumericBoostBury,
  MerchandisingIncludeExclude,
  MerchandisingNumericBoostBury,
} from '@/libs/api';
import {
  type AttributeEdit,
  isBoostOrBury,
  type RuleSetActions,
  type RulesetAttribute,
} from '@/libs/components/types';

type UseRulesetAttributeSaveArgs = {
  dispatch: Dispatch<RuleSetActions>;
  editData: AttributeEdit | null;
  onCloseModal: () => void;
};

export const useRulesetAttributeSave = ({
  dispatch,
  editData,
  onCloseModal,
}: UseRulesetAttributeSaveArgs): ((attribute: RulesetAttribute) => void) =>
  useCallback(
    (attribute: RulesetAttribute) => {
      if (attribute.change === 'modify' && editData) {
        if (
          attribute.type === 'alphanumeric' &&
          isBoostOrBury(attribute.operation)
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
            if (isBoostOrBury(editData.operation)) {
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
          (attribute.operation === 'include' ||
            attribute.operation === 'exclude')
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
            if (isBoostOrBury(editData.operation)) {
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
          isBoostOrBury(attribute.operation)
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
          isBoostOrBury(attribute.operation)
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
          isBoostOrBury(attribute.operation)
        ) {
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
        }

        if (
          attribute.type === 'alphanumeric' &&
          (attribute.operation === 'include' ||
            attribute.operation === 'exclude')
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
    },
    [dispatch, editData, onCloseModal]
  );
