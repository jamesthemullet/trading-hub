import { Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import {
  Categories,
  SelectedCategoryClose,
  SelectedCategoryPill,
  Wrapper,
} from './category.styles';

export const SelectedCategory = ({
  label,
  onClick,
  canRemoveCategory,
}: {
  label: string;
  onClick?: () => void;
  canRemoveCategory?: boolean;
}) => (
  <Wrapper>
    <Text style={{ marginBottom: spacing(1) }}>Category</Text>
    <Categories>
      <SelectedCategoryPill>
        {label}
        {onClick && canRemoveCategory && (
          <SelectedCategoryClose
            aria-label="Remove selected category"
            onClick={onClick}
          />
        )}
      </SelectedCategoryPill>
    </Categories>
  </Wrapper>
);
