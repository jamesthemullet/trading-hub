import type {
  MerchandisingAlphanumericBoostBuryField,
  MerchandisingBlockedProduct,
  MerchandisingExcludedFacet,
  MerchandisingExcludedFacets,
  MerchandisingNumericBoostBury,
  MerchandisingPinnedProduct,
  MerchandisingProductBoostBury,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';

type ProductRule = MerchandisingPinnedProduct | MerchandisingBlockedProduct;
type NumericRule = MerchandisingNumericBoostBury;
type AlphanumericRule = {
  fields: MerchandisingAlphanumericBoostBuryField[];
  weight?: number;
};
type FacetRule = MerchandisingRuleSetFacetConfigWithId;
type ExcludedFacetRule = MerchandisingExcludedFacet;

export type RulesetSnapshot = {
  rules?: {
    pinnedProducts?: MerchandisingPinnedProduct[];
    blockedProducts?: MerchandisingBlockedProduct[];
    boosts?: {
      product?: MerchandisingProductBoostBury[];
      numeric?: MerchandisingNumericBoostBury[];
      alphanumeric?: AlphanumericRule[];
    };
    buries?: {
      product?: MerchandisingProductBoostBury[];
      numeric?: MerchandisingNumericBoostBury[];
      alphanumeric?: AlphanumericRule[];
    };
    includes?: { alphanumeric?: AlphanumericRule[] };
    excludes?: { alphanumeric?: AlphanumericRule[] };
  };
  isEnabled?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  countryCode?: string;
  searchTerms?: string[];
  facets?: FacetRule[];
  excludedFacets?: MerchandisingExcludedFacets;
  type?: string;
  keywords?: string[];
  destinationUrl?: string;
  ruleTitle?: string;
};

const serialise = (value: unknown): string => JSON.stringify(value ?? null);

const labelAlphanumericRule = (rule: AlphanumericRule): string =>
  rule.fields.map((f) => `${f.field}: ${f.values.join(', ')}`).join(' + ');

const diffById = (
  current: ProductRule[] = [],
  previous: ProductRule[] = [],
  addLabel: (id: string) => string,
  removeLabel: (id: string) => string
): string[] => {
  const currentIds = new Set(current.map((p) => p.id));
  const previousIds = new Set(previous.map((p) => p.id));
  return [
    ...current.filter((p) => !previousIds.has(p.id)).map((p) => addLabel(p.id)),
    ...previous
      .filter((p) => !currentIds.has(p.id))
      .map((p) => removeLabel(p.id)),
  ];
};

const diffProductBoostBury = (
  current: MerchandisingProductBoostBury[] = [],
  previous: MerchandisingProductBoostBury[] = [],
  addLabel: (id: string) => string,
  removeLabel: (id: string) => string,
  weightLabel: (id: string, currentWeight: number, prevWeight: number) => string
): string[] => {
  const currentById = new Map(current.map((p) => [p.id, p]));
  const previousById = new Map(previous.map((p) => [p.id, p]));
  return [
    ...current
      .filter((p) => !previousById.has(p.id))
      .map((p) => addLabel(p.id)),
    ...previous
      .filter((p) => !currentById.has(p.id))
      .map((p) => removeLabel(p.id)),
    ...current.flatMap((p) => {
      const prev = previousById.get(p.id);
      if (prev === undefined || prev.weight === p.weight) return [];
      return [weightLabel(p.id, p.weight, prev.weight)];
    }),
  ];
};

const diffByField = (
  current: NumericRule[] = [],
  previous: NumericRule[] = [],
  addLabel: (field: string) => string,
  removeLabel: (field: string) => string,
  weightChangeLabel: (
    field: string,
    currentWeight: number,
    prevWeight: number
  ) => string
): string[] => {
  const currentByField = new Map(current.map((r) => [r.field, r]));
  const previousByField = new Map(previous.map((r) => [r.field, r]));
  return [
    ...current
      .filter((r) => !previousByField.has(r.field))
      .map((r) => addLabel(r.field)),
    ...previous
      .filter((r) => !currentByField.has(r.field))
      .map((r) => removeLabel(r.field)),
    ...current.flatMap((r) => {
      const prev = previousByField.get(r.field);
      if (prev === undefined || prev.weight === r.weight) return [];
      return [weightChangeLabel(r.field, r.weight, prev.weight)];
    }),
  ];
};

const weightDirection = (current: number, previous: number): string =>
  current > previous ? 'increased' : 'reduced';

const diffAlphanumeric = (
  current: AlphanumericRule[] = [],
  previous: AlphanumericRule[] = [],
  addLabel: (rule: AlphanumericRule) => string,
  removeLabel: (rule: AlphanumericRule) => string,
  weightChangeLabel?: (
    rule: AlphanumericRule,
    prevRule: AlphanumericRule
  ) => string
): string[] => {
  const serialiseFields = (r: AlphanumericRule) => serialise(r.fields);
  const previousByFields = new Map(
    previous.map((r) => [serialiseFields(r), r])
  );
  const currentByFields = new Map(current.map((r) => [serialiseFields(r), r]));
  return [
    ...current
      .filter((r) => !previousByFields.has(serialiseFields(r)))
      .map(addLabel),
    ...previous
      .filter((r) => !currentByFields.has(serialiseFields(r)))
      .map(removeLabel),
    ...(weightChangeLabel
      ? current.flatMap((r) => {
          const prev = previousByFields.get(serialiseFields(r));
          if (prev === undefined || prev.weight === r.weight) return [];
          return [weightChangeLabel(r, prev)];
        })
      : []),
  ];
};

const diffDate = (
  current: string | null | undefined,
  previous: string | null | undefined,
  label: string
): string[] => {
  const cur = current ?? null;
  const prev = previous ?? null;
  if (cur === prev) return [];
  if (prev == null) return [`${label} added`];
  if (cur == null) return [`${label} removed`];
  return [`${label} changed`];
};

const getFacetStatus = (
  id: string,
  includedFacets: FacetRule[] = [],
  excludedFacets: ExcludedFacetRule[] = []
): 'included' | 'algo control' | 'excluded' => {
  if (includedFacets.some((f) => f.id === id)) return 'included';
  if (excludedFacets.some((f) => f.id === id)) return 'excluded';
  return 'algo control';
};

const diffFacetStatus = (
  current: RulesetSnapshot,
  previous: RulesetSnapshot,
  facetLabel: (id: string) => string
): string[] => {
  const currentById = new Map((current.facets ?? []).map((f) => [f.id, f]));
  const previousById = new Map((previous.facets ?? []).map((f) => [f.id, f]));

  const allIds = new Set([
    ...(current.facets ?? []).map((f) => f.id),
    ...(previous.facets ?? []).map((f) => f.id),
    ...(current.excludedFacets?.facets ?? [])
      .map((f) => f.id)
      .filter((id): id is string => id !== undefined),
    ...(previous.excludedFacets?.facets ?? [])
      .map((f) => f.id)
      .filter((id): id is string => id !== undefined),
  ]);

  return [...allIds].flatMap((id) => {
    const name = facetLabel(id);
    const currentStatus = getFacetStatus(
      id,
      current.facets,
      current.excludedFacets?.facets
    );
    const previousStatus = getFacetStatus(
      id,
      previous.facets,
      previous.excludedFacets?.facets
    );

    const statusChange =
      currentStatus !== previousStatus
        ? [`'${name}' facet set to ${currentStatus}`]
        : [];

    const cur = currentById.get(id);
    const prev = previousById.get(id);
    const curBoosted = cur?.boosted ?? [];
    const prevBoosted = prev?.boosted ?? [];
    const curExcluded = cur?.excludedValues ?? [];
    const prevExcluded = prev?.excludedValues ?? [];

    const boostedAdded = curBoosted
      .filter((v) => !prevBoosted.includes(v) && !curExcluded.includes(v))
      .map((v) => `'${v}' value set to included in '${name}' facet`);
    const boostedRemoved = prevBoosted
      .filter((v) => !curBoosted.includes(v) && !curExcluded.includes(v))
      .map((v) => `'${v}' value set to algo control in '${name}' facet`);
    const excludedAdded = curExcluded
      .filter((v) => !prevExcluded.includes(v))
      .map((v) => `'${v}' value set to excluded in '${name}' facet`);
    const excludedRemoved = prevExcluded
      .filter((v) => !curExcluded.includes(v) && !curBoosted.includes(v))
      .map((v) => `'${v}' value set to algo control in '${name}' facet`);

    return [
      ...statusChange,
      ...boostedAdded,
      ...boostedRemoved,
      ...excludedAdded,
      ...excludedRemoved,
    ];
  });
};

export const computeHistoryDiff = (
  current: RulesetSnapshot,
  previous: RulesetSnapshot | null,
  facetNames: Record<string, string> = {}
): string[] => {
  if (!previous) {
    return ['Ruleset created', ...computeHistoryDiff(current, {}, facetNames)];
  }

  const facetLabel = (id: string): string => facetNames[id] ?? id;

  return [
    ...diffById(
      current.rules?.pinnedProducts,
      previous.rules?.pinnedProducts,
      (id) => `${id} pinned`,
      (id) => `${id} unpinned`
    ),
    ...diffById(
      current.rules?.blockedProducts,
      previous.rules?.blockedProducts,
      (id) => `${id} blocked`,
      (id) => `${id} unblocked`
    ),
    ...diffProductBoostBury(
      current.rules?.boosts?.product,
      previous.rules?.boosts?.product,
      (id) => `${id} boosted`,
      (id) => `${id} boost removed`,
      (id, cur, prev) =>
        `${id} boost weight ${weightDirection(cur, prev)} to ${cur}`
    ),
    ...diffProductBoostBury(
      current.rules?.buries?.product,
      previous.rules?.buries?.product,
      (id) => `${id} buried`,
      (id) => `${id} bury removed`,
      (id, cur, prev) =>
        `${id} bury weight ${weightDirection(cur, prev)} to ${cur}`
    ),
    ...diffByField(
      current.rules?.boosts?.numeric,
      previous.rules?.boosts?.numeric,
      (field) => `'${field}' attribute boosted`,
      (field) => `'${field}' attribute boost removed`,
      (field, cur, prev) =>
        `'${field}' attribute boost weight ${weightDirection(cur, prev)} to ${cur}`
    ),
    ...diffByField(
      current.rules?.buries?.numeric,
      previous.rules?.buries?.numeric,
      (field) => `'${field}' attribute buried`,
      (field) => `'${field}' attribute bury removed`,
      (field, cur, prev) =>
        `'${field}' attribute bury weight ${weightDirection(cur, prev)} to ${cur}`
    ),
    ...diffAlphanumeric(
      current.rules?.boosts?.alphanumeric,
      previous.rules?.boosts?.alphanumeric,
      (rule) => `'${labelAlphanumericRule(rule)}' attribute boosted`,
      (rule) => `'${labelAlphanumericRule(rule)}' attribute boost removed`,
      (rule, prev) =>
        `'${labelAlphanumericRule(rule)}' attribute boost weight ${weightDirection(rule.weight ?? 0, prev.weight ?? 0)} to ${rule.weight}`
    ),
    ...diffAlphanumeric(
      current.rules?.buries?.alphanumeric,
      previous.rules?.buries?.alphanumeric,
      (rule) => `'${labelAlphanumericRule(rule)}' attribute buried`,
      (rule) => `'${labelAlphanumericRule(rule)}' attribute bury removed`,
      (rule, prev) =>
        `'${labelAlphanumericRule(rule)}' attribute bury weight ${weightDirection(rule.weight ?? 0, prev.weight ?? 0)} to ${rule.weight}`
    ),
    ...diffAlphanumeric(
      current.rules?.includes?.alphanumeric,
      previous.rules?.includes?.alphanumeric,
      (rule) => `Include added: '${labelAlphanumericRule(rule)}'`,
      (rule) => `Include removed: '${labelAlphanumericRule(rule)}'`
    ),
    ...diffAlphanumeric(
      current.rules?.excludes?.alphanumeric,
      previous.rules?.excludes?.alphanumeric,
      (rule) => `Exclude added: '${labelAlphanumericRule(rule)}'`,
      (rule) => `Exclude removed: '${labelAlphanumericRule(rule)}'`
    ),
    ...(current.isEnabled !== previous.isEnabled
      ? [current.isEnabled ? 'Ruleset enabled' : 'Ruleset disabled']
      : []),
    ...diffDate(current.startDate, previous.startDate, 'Start date'),
    ...diffDate(current.endDate, previous.endDate, 'End date'),
    ...(current.countryCode !== previous.countryCode && current.countryCode
      ? [`Country: ${current.countryCode}`]
      : []),
    ...diffFacetStatus(current, previous, facetLabel),
    ...(serialise(current.searchTerms) !== serialise(previous.searchTerms)
      ? [
          ...(current.searchTerms ?? [])
            .filter((t) => !(previous.searchTerms ?? []).includes(t))
            .map((t) => `'${t}' search term added`),
          ...(previous.searchTerms ?? [])
            .filter((t) => !(current.searchTerms ?? []).includes(t))
            .map((t) => `'${t}' search term removed`),
        ]
      : []),
    ...(current.type !== previous.type && current.type
      ? [`Type set to: ${current.type}`]
      : []),
    ...(serialise(current.keywords) !== serialise(previous.keywords)
      ? [
          ...(current.keywords ?? [])
            .filter((k) => !(previous.keywords ?? []).includes(k))
            .map((k) => `'${k}' keyword added`),
          ...(previous.keywords ?? [])
            .filter((k) => !(current.keywords ?? []).includes(k))
            .map((k) => `'${k}' keyword removed`),
        ]
      : []),
    ...(current.destinationUrl !== previous.destinationUrl &&
    current.destinationUrl
      ? [`URL changed to: ${current.destinationUrl}`]
      : []),
    ...(current.ruleTitle !== previous.ruleTitle && current.ruleTitle
      ? [`Title: ${current.ruleTitle}`]
      : []),
  ];
};
