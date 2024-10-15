import {
  Categories,
  CategoryTitle,
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
    <CategoryTitle>Category</CategoryTitle>
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
