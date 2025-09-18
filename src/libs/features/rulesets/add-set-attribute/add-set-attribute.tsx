import type { MerchandisingCountryCode } from '@/libs/api';
import type { AttributeEdit, RulesetAttribute } from '@/libs/components/types';
import { ErrorMessage } from '@/libs/components/typography/typography.styles';
import { useAttributes } from '@/libs/hooks';

import { AddAttribute } from '../add-attribute/add-attribute';

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
        <ErrorMessage role="alert">{alphanumericAttributesError}</ErrorMessage>
      )}
      {numericAttributesError && (
        <ErrorMessage role="alert">{numericAttributesError}</ErrorMessage>
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
