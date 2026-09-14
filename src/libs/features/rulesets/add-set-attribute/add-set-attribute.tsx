import type { ReactElement } from 'react';

import type {
  MerchandisingCountryCode,
  SearchMerchandisingProductsV1ParamsEnum,
} from '@/libs/api';
import { ErrorMessage } from '@/libs/components';
import type { AttributeEdit, RulesetAttribute } from '@/libs/components/types';
import { useAttributes } from '@/libs/hooks';

import { AddAttribute } from '../add-attribute/add-attribute';

type Props = {
  onCancel: () => void;
  onSelect: (attribute: RulesetAttribute) => void;
  countryCode: MerchandisingCountryCode;
  catalogue?: SearchMerchandisingProductsV1ParamsEnum;
  categories?: string[];
  searchTerms?: string[];
  isEditMode: boolean;
  editData: AttributeEdit | null;
};

export const AddSetAttribute = ({
  onCancel,
  onSelect,
  countryCode,
  catalogue,
  categories,
  searchTerms,
  isEditMode,
  editData,
}: Props): ReactElement => {
  const { attributes: numericAttributes, fetchError: numericAttributesError } =
    useAttributes({
      categories,
      searchTerms,
      type: 'numeric',
      countryCode,
      catalogue,
    });
  const {
    attributes: alphanumericAttributes,
    fetchError: alphanumericAttributesError,
  } = useAttributes({
    categories,
    searchTerms,
    type: 'alphanumeric',
    countryCode,
    catalogue,
  });

  return (
    <>
      {alphanumericAttributesError && (
        <ErrorMessage>{alphanumericAttributesError}</ErrorMessage>
      )}
      {numericAttributesError && (
        <ErrorMessage>{numericAttributesError}</ErrorMessage>
      )}
      <AddAttribute
        onCancel={onCancel}
        onSelect={onSelect}
        numericAttributes={numericAttributes}
        alphanumericAttributes={alphanumericAttributes}
        isEditMode={isEditMode}
        editData={editData}
      />
    </>
  );
};
