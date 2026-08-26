import type {
  MerchandisingAlphanumericBoostBury,
  MerchandisingIncludeExclude,
  MerchandisingNumericBoostBury,
  MerchandisingProductBoostBury,
  MerchandisingRuleSet,
} from '@/libs/api';
import {
  createDiffItem,
  diffDate,
  diffFacetValues,
  type DiffItem,
  diffStringList,
} from '@/libs/hooks/utils/diff';

import isEqual from 'lodash/isEqual';

export type { DiffItem };

const formatAlphanumericAttribute = (
  attr: MerchandisingAlphanumericBoostBury | MerchandisingIncludeExclude
): string => {
  const fieldParts = attr.fields.map(
    (f) => `${f.field}: ${f.values.join(', ')}`
  );
  if ('weight' in attr) {
    return `${fieldParts.join('; ')} (weight: ${attr.weight})`;
  }
  return fieldParts.join('; ');
};

const formatNumericAttribute = (attr: MerchandisingNumericBoostBury): string =>
  `${attr.field} (weight: ${attr.weight})`;

const diffProductIds = (
  originalIds: string[],
  currentIds: string[],
  label: string
): DiffItem[] => [
  ...currentIds
    .filter((id) => !originalIds.includes(id))
    .map((id) => createDiffItem('added', label, id)),
  ...originalIds
    .filter((id) => !currentIds.includes(id))
    .map((id) => createDiffItem('removed', label, id)),
];

const diffPinnedProducts = (
  originalIds: string[],
  currentIds: string[]
): DiffItem[] => {
  const label = 'Pinned product';
  const additionsAndMoves = currentIds.flatMap<DiffItem>((id, index) => {
    const origIndex = originalIds.indexOf(id);
    if (origIndex === -1) {
      return [createDiffItem('added', label, id)];
    }
    if (origIndex !== index) {
      return [
        createDiffItem(
          'changed',
          label,
          `${id} (position: ${origIndex + 1} → ${index + 1})`
        ),
      ];
    }
    return [];
  });

  const removals = originalIds
    .filter((id) => !currentIds.includes(id))
    .map((id) => createDiffItem('removed', label, id));

  return [...additionsAndMoves, ...removals];
};

const diffProductBoosts = (
  original: MerchandisingProductBoostBury[],
  current: MerchandisingProductBoostBury[]
): DiffItem[] => {
  const label = 'Boosted product';
  const formatWeight = (weight: number) =>
    weight !== 100 ? ` (${weight}%)` : '';

  const additionsAndChanges = current.flatMap<DiffItem>((curr) => {
    const orig = original.find((o) => o.id === curr.id);
    if (!orig) {
      return [
        createDiffItem(
          'added',
          label,
          `${curr.id}${formatWeight(curr.weight)}`
        ),
      ];
    }
    if (orig.weight !== curr.weight) {
      return [
        createDiffItem(
          'changed',
          label,
          `${curr.id} (${orig.weight}% → ${curr.weight}%)`
        ),
      ];
    }
    return [];
  });

  const removals = original
    .filter((orig) => !current.some((c) => c.id === orig.id))
    .map((orig) =>
      createDiffItem('removed', label, `${orig.id}${formatWeight(orig.weight)}`)
    );

  return [...additionsAndChanges, ...removals];
};

const diffWeightedAlphanumericAttributes = (
  original: MerchandisingAlphanumericBoostBury[],
  current: MerchandisingAlphanumericBoostBury[],
  label: string
): DiffItem[] => {
  const additionsAndChanges = current.flatMap<DiffItem>((curr) => {
    const orig = original.find((o) => isEqual(o.fields, curr.fields));
    if (!orig) {
      return [
        createDiffItem('added', label, formatAlphanumericAttribute(curr)),
      ];
    }

    if (orig.weight !== curr.weight) {
      const fieldParts = curr.fields.map(
        (f) => `${f.field}: ${f.values.join(', ')}`
      );
      return [
        createDiffItem(
          'changed',
          label,
          `${fieldParts.join('; ')} (weight: ${orig.weight} → ${curr.weight})`
        ),
      ];
    }
    return [];
  });

  const removals = original
    .filter((orig) => !current.some((c) => isEqual(c.fields, orig.fields)))
    .map((orig) =>
      createDiffItem('removed', label, formatAlphanumericAttribute(orig))
    );

  return [...additionsAndChanges, ...removals];
};

const diffAlphanumericAttributes = (
  original: MerchandisingIncludeExclude[],
  current: MerchandisingIncludeExclude[],
  label: string
): DiffItem[] => {
  const additions = current
    .filter(
      (curr) => !original.some((orig) => isEqual(orig.fields, curr.fields))
    )
    .map((curr) =>
      createDiffItem('added', label, formatAlphanumericAttribute(curr))
    );

  const removals = original
    .filter(
      (orig) => !current.some((curr) => isEqual(curr.fields, orig.fields))
    )
    .map((orig) =>
      createDiffItem('removed', label, formatAlphanumericAttribute(orig))
    );

  return [...additions, ...removals];
};

const diffNumericAttributes = (
  original: MerchandisingNumericBoostBury[],
  current: MerchandisingNumericBoostBury[],
  label: string
): DiffItem[] => {
  const additionsAndChanges = current.flatMap<DiffItem>((curr) => {
    const orig = original.find((o) => o.field === curr.field);
    if (!orig) {
      return [createDiffItem('added', label, formatNumericAttribute(curr))];
    }
    if (orig.weight !== curr.weight) {
      return [
        createDiffItem(
          'changed',
          label,
          `${curr.field} (weight: ${orig.weight} → ${curr.weight})`
        ),
      ];
    }
    return [];
  });

  const removals = original
    .filter((orig) => !current.some((c) => c.field === orig.field))
    .map((orig) =>
      createDiffItem('removed', label, formatNumericAttribute(orig))
    );

  return [...additionsAndChanges, ...removals];
};

const diffDates = (
  original: MerchandisingRuleSet,
  current: MerchandisingRuleSet
): DiffItem[] => [
  ...diffDate(original.startDate, current.startDate, 'Start date'),
  ...diffDate(original.endDate, current.endDate, 'End date'),
];

const diffCountryCode = (
  original: MerchandisingRuleSet,
  current: MerchandisingRuleSet
): DiffItem[] =>
  original.countryCode === current.countryCode
    ? []
    : [
        createDiffItem(
          'changed',
          'Country',
          `${original.countryCode ?? 'none'} → ${current.countryCode ?? 'none'}`
        ),
      ];

const facetLabel = (id: string, facetNames: Record<string, string>): string =>
  facetNames[id] ?? id;

const diffFacetOrder = (
  originalIds: string[],
  currentIds: string[],
  facetNames: Record<string, string>
): DiffItem[] => {
  const originalOrder = originalIds.filter((id) => currentIds.includes(id));
  const currentOrder = currentIds.filter((id) => originalIds.includes(id));

  return currentOrder.flatMap<DiffItem>((id) => {
    const origIndex = originalOrder.indexOf(id);
    const currIndex = currentOrder.indexOf(id);
    if (origIndex === currIndex) return [];

    const direction = currIndex < origIndex ? 'up' : 'down';
    return [
      createDiffItem(
        'changed',
        `Facet order ${direction}`,
        `${facetLabel(id, facetNames)}: position ${origIndex + 1} → ${
          currIndex + 1
        }`
      ),
    ];
  });
};

const diffFacets = (
  original: MerchandisingRuleSet['facets'] = [],
  current: MerchandisingRuleSet['facets'] = [],
  facetNames: Record<string, string> = {}
): DiffItem[] => {
  const originalById = new Map(original.map((facet) => [facet.id, facet]));
  const currentById = new Map(current.map((facet) => [facet.id, facet]));

  const valueChanges = current.flatMap<DiffItem>((facet) => {
    const originalFacet = originalById.get(facet.id);
    if (!originalFacet) return [];
    return diffFacetValues(
      originalFacet.boosted ?? [],
      facet.boosted ?? [],
      originalFacet.excludedValues ?? [],
      facet.excludedValues ?? []
    );
  });

  return [
    ...current
      .filter((facet) => !originalById.has(facet.id))
      .map((facet) =>
        createDiffItem('added', 'Facet', facetLabel(facet.id, facetNames))
      ),
    ...original
      .filter((facet) => !currentById.has(facet.id))
      .map((facet) =>
        createDiffItem('removed', 'Facet', facetLabel(facet.id, facetNames))
      ),
    ...valueChanges,
    ...diffFacetOrder(
      original.map((facet) => facet.id),
      current.map((facet) => facet.id),
      facetNames
    ),
  ];
};

export const useRulesetDiff = (
  original: MerchandisingRuleSet | undefined,
  current: MerchandisingRuleSet,
  options?: {
    isEnabled?: boolean;
    originalCategoryIds?: string[];
    currentCategoryIds?: string[];
    originalSearchTerms?: string[];
    currentSearchTerms?: string[];
    facetNames?: Record<string, string>;
  }
): DiffItem[] => {
  if (!original || options?.isEnabled === false) return [];

  const origRules = original.rules;
  const currRules = current.rules;
  const originalSearchTerms = options?.originalSearchTerms ?? [];
  const currentSearchTerms = options?.currentSearchTerms ?? [];

  return [
    ...diffProductIds(
      options?.originalCategoryIds ?? [],
      options?.currentCategoryIds ?? [],
      'Category'
    ),
    ...diffPinnedProducts(
      origRules.pinnedProducts.map((product) => product.id),
      currRules.pinnedProducts.map((product) => product.id)
    ),
    ...diffProductIds(
      origRules.blockedProducts.map((product) => product.id),
      currRules.blockedProducts.map((product) => product.id),
      'Blocked product'
    ),
    ...diffProductBoosts(origRules.boosts.product, currRules.boosts.product),
    ...diffProductIds(
      origRules.buries.product.map((product) => product.id),
      currRules.buries.product.map((product) => product.id),
      'Buried product'
    ),
    ...diffNumericAttributes(
      origRules.boosts.numeric,
      currRules.boosts.numeric,
      'Numeric boost'
    ),
    ...diffWeightedAlphanumericAttributes(
      origRules.boosts.alphanumeric,
      currRules.boosts.alphanumeric,
      'Alphanumeric boost'
    ),
    ...diffNumericAttributes(
      origRules.buries.numeric,
      currRules.buries.numeric,
      'Numeric bury'
    ),
    ...diffWeightedAlphanumericAttributes(
      origRules.buries.alphanumeric,
      currRules.buries.alphanumeric,
      'Alphanumeric bury'
    ),
    ...diffAlphanumericAttributes(
      origRules.includes.alphanumeric ?? [],
      currRules.includes.alphanumeric ?? [],
      'Include attribute'
    ),
    ...diffAlphanumericAttributes(
      origRules.excludes.alphanumeric ?? [],
      currRules.excludes.alphanumeric ?? [],
      'Exclude attribute'
    ),
    ...diffDates(original, current),
    ...diffCountryCode(original, current),
    ...diffFacets(original.facets, current.facets, options?.facetNames),
    ...diffStringList(originalSearchTerms, currentSearchTerms, 'Keyword'),
  ];
};
