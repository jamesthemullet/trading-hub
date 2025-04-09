import type { MerchandisingCountryCode } from '@/libs/api';
import { useAttributes } from '@/libs/hooks';

import type { AttributeEdit, RulesetAttribute } from '../types';
import { ErrorMessage } from '../typography/typography.styles';
import { AddAttribute } from './add-attribute';

type Props = {
  onCancel: () => void;
  onSelect: (attribute: RulesetAttribute) => void;
  countryCode: MerchandisingCountryCode;
  categories?: string[];
  searchTerms?: string[];
  isEditMode: boolean;
  editData: AttributeEdit | null;
};

export const AddSetAttribute = ({
  onCancel,
  onSelect,
  countryCode,
  categories,
  searchTerms,
  isEditMode,
  editData,
}: Props) => {
  const { attributes: numericAttributes, fetchError: numericAttributesError } =
    useAttributes({
      categories,
      searchTerms,
      type: 'numeric',
      countryCode,
    });
  const {
    attributes: alphanumericAttributes,
    fetchError: alphanumericAttributesError,
  } = useAttributes({
    categories,
    searchTerms,
    type: 'alphanumeric',
    countryCode,
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
