import { useCategoryAttributes } from '@/libs/hooks';

import { RulesetAttribute } from '../types';
import { AddAttribute } from './add-attribute';

type Props = {
  onCancel: () => void;
  onSelect: (attribute: RulesetAttribute) => void;
  category: string;
};

export const AddCategoryAttribute = ({
  onCancel,
  onSelect,
  category,
}: Props) => {
  const { attributes: numericAttributes } = useCategoryAttributes(
    category,
    'numeric'
  );
  const { attributes: alphanumericAttributes } = useCategoryAttributes(
    category,
    'alphanumeric'
  );

  return (
    <AddAttribute
      onCancel={onCancel}
      onSelect={onSelect}
      numericAttributes={numericAttributes}
      alphanumericAttributes={alphanumericAttributes}
    />
  );
};
