import {
  createDiffItem,
  diffDate,
  type DiffItem,
  diffStringList,
} from '@/libs/hooks/utils/diff';

type FacetStatus = 'Included' | 'Excluded' | 'Algo control';
type FacetWithId = { id?: string };
type FacetWithDisplay = { id: string; displayValue: string };

const getDisplayName = (id: string, allFacets: FacetWithDisplay[]): string =>
  allFacets.find((f) => f.id === id)?.displayValue ?? id;

const toDefinedIds = (facets: FacetWithId[]): string[] =>
  facets.map((f) => f.id).filter((id): id is string => id !== undefined);

const getStatus = (
  id: string,
  includedIds: string[],
  excludedIds: string[]
): FacetStatus => {
  if (includedIds.includes(id)) return 'Included';
  if (excludedIds.includes(id)) return 'Excluded';
  return 'Algo control';
};

type CategoryInfo = { id: string; name?: string };

const formatCategoryDescription = (category: CategoryInfo): string =>
  category.name ? `${category.id} | ${category.name}` : category.id;

const diffCategories = (
  original: CategoryInfo[],
  current: CategoryInfo[]
): DiffItem[] => [
  ...current
    .filter((c) => !original.some((o) => o.id === c.id))
    .map((c) =>
      createDiffItem('added', 'Category', formatCategoryDescription(c))
    ),
  ...original
    .filter((o) => !current.some((c) => c.id === o.id))
    .map((o) =>
      createDiffItem('removed', 'Category', formatCategoryDescription(o))
    ),
];

type FacetListDiffOptions = {
  originalCategories?: CategoryInfo[];
  currentCategories?: CategoryInfo[];
  originalSearchTerms?: string[];
  currentSearchTerms?: string[];
  originalStartDate?: string;
  currentStartDate?: string;
  originalEndDate?: string;
  currentEndDate?: string;
};

export const useFacetListDiff = (
  originalFacets: FacetWithId[],
  currentFacets: FacetWithId[],
  originalExcludedFacets: FacetWithId[],
  currentExcludedFacets: FacetWithId[],
  allFacets: FacetWithDisplay[],
  options: FacetListDiffOptions = {}
): DiffItem[] => {
  const origIncluded = toDefinedIds(originalFacets);
  const currIncluded = toDefinedIds(currentFacets);
  const origExcluded = toDefinedIds(originalExcludedFacets);
  const currExcluded = toDefinedIds(currentExcludedFacets);

  const allIds = [
    ...new Set([
      ...origIncluded,
      ...currIncluded,
      ...origExcluded,
      ...currExcluded,
    ]),
  ];

  const facetDiffs = allIds.flatMap<DiffItem>((id) => {
    const displayName = getDisplayName(id, allFacets);
    const origStatus = getStatus(id, origIncluded, origExcluded);
    const currStatus = getStatus(id, currIncluded, currExcluded);

    if (origStatus !== currStatus) {
      return [
        createDiffItem(
          'changed',
          currStatus,
          `${displayName} (${origStatus} → ${currStatus})`
        ),
      ];
    }

    if (origStatus === 'Included') {
      const origIndex = origIncluded.indexOf(id);
      const currIndex = currIncluded.indexOf(id);
      if (origIndex !== currIndex) {
        const direction = currIndex < origIndex ? 'up' : 'down';
        return [
          createDiffItem(
            'changed',
            `Facet order ${direction}`,
            `${displayName}: position ${origIndex + 1} → ${currIndex + 1}`
          ),
        ];
      }
    }

    return [];
  });

  return [
    ...diffCategories(
      options.originalCategories ?? [],
      options.currentCategories ?? []
    ),
    ...diffStringList(
      options.originalSearchTerms ?? [],
      options.currentSearchTerms ?? [],
      'Keyword'
    ),
    ...diffDate(
      options.originalStartDate,
      options.currentStartDate,
      'Start date'
    ),
    ...diffDate(options.originalEndDate, options.currentEndDate, 'End date'),
    ...facetDiffs,
  ];
};
