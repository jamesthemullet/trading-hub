export const formatCategoriesInfo = (
  categoriesInfo: Array<{
    id: string;
    name?: string;
    plpUrl?: string;
  }>
) => {
  return categoriesInfo
    .map((category) =>
      category.name ? `${category.id} - ${category.name}` : `${category.id}`
    )
    .join(' | ');
};
