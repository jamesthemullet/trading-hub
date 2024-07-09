import { useGlobalAttributes } from '@/libs/hooks';
import { EditAttribute } from '@/libs/modules/ruleset/ruleset';

import { AddAttribute } from './add-attribute';

type Props = {
  onCancel: () => void;
  onSelect: (attribute: EditAttribute) => void;
};
export const AddGlobalAttribute = ({ onCancel, onSelect }: Props) => {
  const { attributes: numericAttributes } = useGlobalAttributes('numeric');
  const { attributes: alphanumericAttributes } =
    useGlobalAttributes('alphanumeric');

  return (
    <AddAttribute
      onCancel={onCancel}
      onSelect={onSelect}
      numericAttributes={numericAttributes}
      alphanumericAttributes={alphanumericAttributes}
    />
  );
};
