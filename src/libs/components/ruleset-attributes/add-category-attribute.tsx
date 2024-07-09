import { useCategoryAttributes } from '@/libs/hooks';
import { EditAttribute } from '@/libs/modules/ruleset/ruleset';

import { AddAttribute } from './add-attribute';

type Props = {
  onCancel: () => void;
  onSelect: (attribute: EditAttribute) => void;
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
