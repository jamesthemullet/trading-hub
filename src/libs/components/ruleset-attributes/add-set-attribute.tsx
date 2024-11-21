import { CountryCode } from '@/libs/api';
import { useAttributes } from '@/libs/hooks';

import { RulesetAttribute } from '../types';
import { ErrorMessage } from '../typography/typography.styles';
import { AddAttribute } from './add-attribute';

type Props = {
  onCancel: () => void;
  onSelect: (attribute: RulesetAttribute) => void;
  countryCode: CountryCode;
  category?: string;
  searchTerms?: string[];
};

export const AddSetAttribute = ({
  onCancel,
  onSelect,
  countryCode,
  category,
  searchTerms,
}: Props) => {
  const { attributes: numericAttributes, fetchError: numericAttributesError } =
    useAttributes({
      category,
      searchTerms,
      type: 'numeric',
      countryCode,
    });
  const {
    attributes: alphanumericAttributes,
    fetchError: alphanumericAttributesError,
  } = useAttributes({
    category,
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
      />
    </>
  );
};
