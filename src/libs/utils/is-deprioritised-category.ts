const DEPRIORITISED_CATEGORY_PREFIX = 'IE_';

export const isDeprioritisedCategory = (id?: string): boolean =>
  Boolean(id?.startsWith(DEPRIORITISED_CATEGORY_PREFIX));

/**
 * IE_ categories should be deprioritised as the default preview - prefer
 * the first non-IE_ category if one exists, falling back to the first
 * category otherwise (e.g. when every selected category is IE_).
 */
export const getDefaultPreviewCategoryId = (
  categoryIds: string[] | undefined
): string | undefined =>
  categoryIds?.find((id) => !isDeprioritisedCategory(id)) ?? categoryIds?.[0];
