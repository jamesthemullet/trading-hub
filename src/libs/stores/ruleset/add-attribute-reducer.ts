import type { AttributeEdit } from '@/libs/components/types';

export type AddAttributeState = {
  modalStep: number;
  selectedAttributeType: 'numeric' | 'alphanumeric';
  selectedOperation: 'boost' | 'bury' | 'include' | 'exclude';
  weight: number;
  selectedNumericField: string;
  selectedAlphanumericValues: Array<{ field: string; values: Array<string> }>;
  alphanumericField: string;
  alphanumericAttributeValues: string[];
};

export type AddAttributeAction =
  | { type: 'goToStep'; payload: number }
  | { type: 'goBackFromNumeric' }
  | { type: 'goBackFromAlphanumericAttributes' }
  | { type: 'goBackFromAlphanumericValues' }
  | { type: 'selectNumericField'; payload: string }
  | {
      type: 'selectAlphanumericField';
      payload: { field: string; values: string[] };
    }
  | { type: 'setOperation'; payload: 'boost' | 'bury' | 'include' | 'exclude' }
  | { type: 'setWeight'; payload: number }
  | {
      type: 'toggleAlphanumericValue';
      payload: { name: string; isSelected: boolean };
    }
  | { type: 'initialize'; payload: AttributeEdit };

export const addAttributeReducer = (
  state: AddAttributeState,
  action: AddAttributeAction
): AddAttributeState => {
  switch (action.type) {
    case 'goToStep':
      return { ...state, modalStep: action.payload };

    case 'goBackFromNumeric':
      return { ...state, modalStep: 0, selectedNumericField: '' };

    case 'goBackFromAlphanumericAttributes':
      return {
        ...state,
        modalStep: 0,
        selectedAlphanumericValues: [],
        selectedNumericField: '',
        selectedOperation: 'boost',
      };

    case 'goBackFromAlphanumericValues':
      return { ...state, modalStep: 2 };

    case 'selectNumericField':
      return {
        ...state,
        selectedNumericField: action.payload,
        selectedAttributeType: 'numeric',
      };

    case 'selectAlphanumericField':
      return {
        ...state,
        alphanumericField: action.payload.field,
        alphanumericAttributeValues: action.payload.values,
        modalStep: 3,
      };

    case 'setOperation':
      return { ...state, selectedOperation: action.payload };

    case 'setWeight':
      return { ...state, weight: action.payload };

    case 'toggleAlphanumericValue': {
      const { name, isSelected } = action.payload;
      const currentValues =
        state.selectedAlphanumericValues.find(
          (attr) => attr.field === state.alphanumericField
        )?.values || [];

      const newValues = isSelected
        ? [...currentValues, name]
        : currentValues.filter((v) => v !== name);

      const updatedFields = state.selectedAlphanumericValues.filter(
        (attr) => attr.field !== state.alphanumericField
      );

      return {
        ...state,
        selectedAttributeType: 'alphanumeric',
        selectedAlphanumericValues: [
          ...updatedFields,
          { field: state.alphanumericField, values: newValues },
        ],
      };
    }

    case 'initialize': {
      const { payload } = action;
      const base = { ...state, selectedOperation: payload.operation };

      switch (payload.type) {
        case 'numericBoostBury':
          return {
            ...base,
            modalStep: 1,
            selectedAttributeType: 'numeric',
            selectedNumericField: payload.field.field,
            weight: payload.weight,
          };
        case 'alphanumericBoostBury':
          return {
            ...base,
            modalStep: 2,
            selectedAttributeType: 'alphanumeric',
            selectedAlphanumericValues: payload.fields,
            weight: payload.weight,
          };
        case 'alphanumericIncludeExclude':
          return {
            ...base,
            modalStep: 2,
            selectedAttributeType: 'alphanumeric',
            selectedAlphanumericValues: payload.fields,
          };
      }
    }
  }
};
