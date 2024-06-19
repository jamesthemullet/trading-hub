import { Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';

import {
  Wrapper,
  Categories,
  SelectedCategoryPill,
  SelectedCategoryClose,
} from './category.styles';

export const SelectedCategory = ({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) => (
  <Wrapper>
    <Text style={{ marginBottom: spacing(1) }}>Category</Text>
    <Categories>
      <SelectedCategoryPill>
        {label}
        {onClick && (
          <SelectedCategoryClose
            aria-label="Remove selected category"
            onClick={onClick}
          />
        )}
      </SelectedCategoryPill>
    </Categories>
  </Wrapper>
);
