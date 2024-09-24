import { useAttributes } from '@/libs/hooks';

import { RulesetAttribute } from '../types';
import { AddAttribute } from './add-attribute';

type Props = {
  onCancel: () => void;
  onSelect: (attribute: RulesetAttribute) => void;
  category?: string;
  searchTerms?: string[];
};

export const AddSetAttribute = ({
  onCancel,
  onSelect,
  category,
  searchTerms,
}: Props) => {
  const { attributes: numericAttributes } = useAttributes({
    category,
    searchTerms,
    type: 'numeric',
  });
  const { attributes: alphanumericAttributes } = useAttributes({
    category,
    searchTerms,
    type: 'alphanumeric',
  });

  return (
    <AddAttribute
      onCancel={onCancel}
      onSelect={onSelect}
      numericAttributes={numericAttributes}
      alphanumericAttributes={alphanumericAttributes}
    />
  );
};
