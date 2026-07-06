import type {
  MerchandisingAlphanumericBoostBury,
  MerchandisingIncludeExclude,
  MerchandisingNumericBoostBury,
  MerchandisingRuleSet,
} from '@/libs/api';

import { format, isValid, parseISO } from 'date-fns';
import isEqual from 'lodash/isEqual';

export type DiffItem = {
  type: 'added' | 'removed' | 'changed';
  label: string;
  description: string;
};

const createDiffItem = (
  type: DiffItem['type'],
  label: string,
  description: string
): DiffItem => ({ type, label, description });

const formatDate = (date: string | undefined): string => {
  if (!date) return 'none';
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) return 'none';

  return format(parsedDate, 'dd/MM/yyyy HH:mm');
};

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
  ...(original.startDate !== current.startDate
    ? [
        createDiffItem(
          'changed',
          'Start date',
          `${formatDate(original.startDate)} → ${formatDate(current.startDate)}`
        ),
      ]
    : []),
  ...(original.endDate !== current.endDate
    ? [
        createDiffItem(
          'changed',
          'End date',
          `${formatDate(original.endDate)} → ${formatDate(current.endDate)}`
        ),
      ]
    : []),
];

export const useRulesetDiff = (
  original: MerchandisingRuleSet | undefined,
  current: MerchandisingRuleSet,
  options?: {
    isEnabled?: boolean;
    originalCategoryIds?: string[];
    currentCategoryIds?: string[];
    originalSearchTerms?: string[];
    currentSearchTerms?: string[];
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
    ...diffProductIds(
      origRules.boosts.product.map((product) => product.id),
      currRules.boosts.product.map((product) => product.id),
      'Boosted product'
    ),
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
    ...originalSearchTerms
      .filter((t) => !currentSearchTerms.includes(t))
      .map((t) => createDiffItem('removed', 'Keyword', t)),
    ...currentSearchTerms
      .filter((t) => !originalSearchTerms.includes(t))
      .map((t) => createDiffItem('added', 'Keyword', t)),
  ];
};
