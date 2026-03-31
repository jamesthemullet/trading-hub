export enum RuleType {
  CategoryRanking = 'categoryRanking',
  SearchRanking = 'searchRanking',
  Global = 'global',
  Redirect = 'redirect',
}

export type NonRedirectRuleType = Exclude<RuleType, RuleType.Redirect>;

export enum FacetType {
  Category = 'category',
  Search = 'search',
  Global = 'global',
}
