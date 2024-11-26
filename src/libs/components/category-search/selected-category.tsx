import {
  Categories,
  CategoryTitle,
  SelectedCategoryPill,
  Wrapper,
} from './category.styles';

export const SelectedCategory = ({ label }: { label: string }) => (
  <Wrapper>
    <CategoryTitle>Category</CategoryTitle>
    <Categories>
      <SelectedCategoryPill>{label}</SelectedCategoryPill>
    </Categories>
  </Wrapper>
);
