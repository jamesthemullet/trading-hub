import type {
  MerchandisingAlphanumericBoostBuryField,
  MerchandisingBlockedProduct,
  MerchandisingExcludedFacets,
  MerchandisingNumericBoostBury,
  MerchandisingPinnedProduct,
  MerchandisingProduct,
  MerchandisingProductBoostBury,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';

type ProductInfo = Pick<MerchandisingProduct, 'title' | 'brand'>;
type ProductRule = (MerchandisingPinnedProduct | MerchandisingBlockedProduct) &
  ProductInfo;
type ProductBoostBury = MerchandisingProductBoostBury & ProductInfo;
type NumericRule = MerchandisingNumericBoostBury;
type AlphanumericRule = {
  fields: MerchandisingAlphanumericBoostBuryField[];
  weight?: number;
};
type FacetRule = MerchandisingRuleSetFacetConfigWithId;

export type RulesetSnapshot = {
  rules?: {
    pinnedProducts?: ProductRule[];
    blockedProducts?: ProductRule[];
    boosts?: {
      product?: ProductBoostBury[];
      numeric?: MerchandisingNumericBoostBury[];
      alphanumeric?: AlphanumericRule[];
    };
    buries?: {
      product?: ProductBoostBury[];
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
  rule.fields
    .map((field) => `${field.field}: ${field.values.join(', ')}`)
    .join(' + ');

const productDisplayName = (product: ProductInfo): string =>
  [product.brand, product.title].filter(Boolean).join(' ');

const diffById = (
  current: ProductRule[] = [],
  previous: ProductRule[] = [],
  addLabel: (id: string, name: string) => string,
  removeLabel: (id: string, name: string) => string
): string[] => {
  const currentIds = new Set(current.map((product) => product.id));
  const previousIds = new Set(previous.map((product) => product.id));
  return [
    ...current
      .filter((product) => !previousIds.has(product.id))
      .map((product) => addLabel(product.id, productDisplayName(product))),
    ...previous
      .filter((product) => !currentIds.has(product.id))
      .map((product) => removeLabel(product.id, productDisplayName(product))),
  ];
};

const diffProductBoostBury = (
  current: ProductBoostBury[] = [],
  previous: ProductBoostBury[] = [],
  addLabel: (id: string, name: string) => string,
  removeLabel: (id: string, name: string) => string,
  weightLabel: (
    id: string,
    name: string,
    currentWeight: number,
    prevWeight: number
  ) => string
): string[] => {
  const currentById = new Map(current.map((product) => [product.id, product]));
  const previousById = new Map(
    previous.map((product) => [product.id, product])
  );
  return [
    ...current
      .filter((product) => !previousById.has(product.id))
      .map((product) => addLabel(product.id, productDisplayName(product))),
    ...previous
      .filter((product) => !currentById.has(product.id))
      .map((product) => removeLabel(product.id, productDisplayName(product))),
    ...current.flatMap((product) => {
      const prev = previousById.get(product.id);
      if (prev === undefined || prev.weight === product.weight) return [];
      const name = productDisplayName(product) || productDisplayName(prev);
      return [weightLabel(product.id, name, product.weight, prev.weight)];
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
  const currentByField = new Map(current.map((rule) => [rule.field, rule]));
  const previousByField = new Map(previous.map((rule) => [rule.field, rule]));
  return [
    ...current
      .filter((rule) => !previousByField.has(rule.field))
      .map((rule) => addLabel(rule.field)),
    ...previous
      .filter((rule) => !currentByField.has(rule.field))
      .map((rule) => removeLabel(rule.field)),
    ...current.flatMap((rule) => {
      const prev = previousByField.get(rule.field);
      if (prev === undefined || prev.weight === rule.weight) return [];
      return [weightChangeLabel(rule.field, rule.weight, prev.weight)];
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
  const serialiseFields = (rule: AlphanumericRule) => serialise(rule.fields);
  const previousByFields = new Map(
    previous.map((rule) => [serialiseFields(rule), rule])
  );
  const currentByFields = new Map(
    current.map((rule) => [serialiseFields(rule), rule])
  );
  return [
    ...current
      .filter((rule) => !previousByFields.has(serialiseFields(rule)))
      .map(addLabel),
    ...previous
      .filter((rule) => !currentByFields.has(serialiseFields(rule)))
      .map(removeLabel),
    ...(weightChangeLabel
      ? current.flatMap((rule) => {
          const prev = previousByFields.get(serialiseFields(rule));
          if (prev === undefined || prev.weight === rule.weight) return [];
          return [weightChangeLabel(rule, prev)];
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
  includedFacetIds: ReadonlySet<string>,
  excludedFacetIds: ReadonlySet<string>
): 'included' | 'algo control' | 'excluded' => {
  if (includedFacetIds.has(id)) return 'included';
  if (excludedFacetIds.has(id)) return 'excluded';
  return 'algo control';
};

const diffFacetStatus = (
  current: RulesetSnapshot,
  previous: RulesetSnapshot,
  facetLabel: (id: string) => string
): string[] => {
  const currentById = new Map(
    (current.facets ?? []).map((facet) => [facet.id, facet])
  );
  const previousById = new Map(
    (previous.facets ?? []).map((facet) => [facet.id, facet])
  );
  const currentIncludedIds = new Set(currentById.keys());
  const previousIncludedIds = new Set(previousById.keys());
  const currentExcludedIds = new Set(
    (current.excludedFacets?.facets ?? []).flatMap((facet) =>
      facet.id === undefined ? [] : [facet.id]
    )
  );
  const previousExcludedIds = new Set(
    (previous.excludedFacets?.facets ?? []).flatMap((facet) =>
      facet.id === undefined ? [] : [facet.id]
    )
  );

  const allIds = new Set([
    ...currentIncludedIds,
    ...previousIncludedIds,
    ...currentExcludedIds,
    ...previousExcludedIds,
  ]);

  return [...allIds].flatMap((id) => {
    const name = facetLabel(id);
    const currentStatus = getFacetStatus(
      id,
      currentIncludedIds,
      currentExcludedIds
    );
    const previousStatus = getFacetStatus(
      id,
      previousIncludedIds,
      previousExcludedIds
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
    const curBoostedSet = new Set(curBoosted);
    const prevBoostedSet = new Set(prevBoosted);
    const curExcludedSet = new Set(curExcluded);
    const prevExcludedSet = new Set(prevExcluded);

    const boostedAdded = curBoosted
      .filter(
        (value) => !prevBoostedSet.has(value) && !curExcludedSet.has(value)
      )
      .map((value) => `'${value}' value set to included in '${name}' facet`);
    const boostedRemoved = prevBoosted
      .filter(
        (value) => !curBoostedSet.has(value) && !curExcludedSet.has(value)
      )
      .map(
        (value) => `'${value}' value set to algo control in '${name}' facet`
      );
    const excludedAdded = curExcluded
      .filter((value) => !prevExcludedSet.has(value))
      .map((value) => `'${value}' value set to excluded in '${name}' facet`);
    const excludedRemoved = prevExcluded
      .filter(
        (value) => !curExcludedSet.has(value) && !curBoostedSet.has(value)
      )
      .map(
        (value) => `'${value}' value set to algo control in '${name}' facet`
      );

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
  const withName = (line: string, name: string): string =>
    name ? `${line}\n${name}` : line;

  return [
    ...diffById(
      current.rules?.pinnedProducts,
      previous.rules?.pinnedProducts,
      (id, name) => withName(`${id} pinned`, name),
      (id, name) => withName(`${id} unpinned`, name)
    ),
    ...diffById(
      current.rules?.blockedProducts,
      previous.rules?.blockedProducts,
      (id, name) => withName(`${id} blocked`, name),
      (id, name) => withName(`${id} unblocked`, name)
    ),
    ...diffProductBoostBury(
      current.rules?.boosts?.product,
      previous.rules?.boosts?.product,
      (id, name) => withName(`${id} boosted`, name),
      (id, name) => withName(`${id} boost removed`, name),
      (id, name, cur, prev) =>
        withName(
          `${id} boost weight ${weightDirection(cur, prev)} to ${cur}`,
          name
        )
    ),
    ...diffProductBoostBury(
      current.rules?.buries?.product,
      previous.rules?.buries?.product,
      (id, name) => withName(`${id} buried`, name),
      (id, name) => withName(`${id} bury removed`, name),
      (id, name, cur, prev) =>
        withName(
          `${id} bury weight ${weightDirection(cur, prev)} to ${cur}`,
          name
        )
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
            .filter((term) => !(previous.searchTerms ?? []).includes(term))
            .map((term) => `'${term}' search term added`),
          ...(previous.searchTerms ?? [])
            .filter((term) => !(current.searchTerms ?? []).includes(term))
            .map((term) => `'${term}' search term removed`),
        ]
      : []),
    ...(current.type !== previous.type && current.type
      ? [`Type set to: ${current.type}`]
      : []),
    ...(serialise(current.keywords) !== serialise(previous.keywords)
      ? [
          ...(current.keywords ?? [])
            .filter((keyword) => !(previous.keywords ?? []).includes(keyword))
            .map((keyword) => `'${keyword}' keyword added`),
          ...(previous.keywords ?? [])
            .filter((keyword) => !(current.keywords ?? []).includes(keyword))
            .map((keyword) => `'${keyword}' keyword removed`),
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
