export const ROUTES = {
  CATEGORY: {
    FACETS: {
      NEW: '/category/facets/new',
      EDIT: (id: string) => `/category/facets/edit/${id}`,
      VALUES: {
        EDIT: (id: string) => `/category/facets/values/edit/${id}`,
      },
    },
    RULESETS: {
      NEW: '/category/rulesets/new',
      EDIT: (id: string) => `/category/rulesets/edit/${id}`,
    },
    HISTORY: (id: string) => `/category/history/${id}`,
  },
  SEARCH: {
    FACETS: {
      NEW: '/search/facets/new',
      EDIT: (id: string) => `/search/facets/edit/${id}`,
      VALUES: {
        EDIT: (id: string) => `/search/facets/values/edit/${id}`,
      },
    },
    HISTORY: (id: string) => `/search/history/${id}`,
    RULESETS: {
      NEW: '/search/rulesets/new',
      EDIT: (id: string) => `/search/rulesets/edit/${id}`,
    },
    REDIRECTS: {
      NEW: '/search/redirects/new',
      EDIT: (id: string) => `/search/redirects/edit/${id}`,
      HISTORY: (id: string) => `/search/redirects/history/${id}`,
    },
  },
  GLOBAL: {
    FACETS: {
      NEW: '/global/facets/new',
      EDIT: (id: string) => `/global/facets/edit/${id}`,
      VALUES: {
        EDIT: (id: string) => `/global/facets/values/edit/${id}`,
      },
    },
    RULESETS: {
      NEW: '/global/rulesets/new',
      EDIT: (id: string) => `/global/rulesets/edit/${id}`,
    },
    HISTORY: (id: string) => `/global/history/${id}`,
  },
} as const;

export const getFacetRoute = (
  facetType: 'search' | 'category' | 'global',
  routeType: 'edit' | 'valuesEdit',
  id: string
): string => {
  const typeMap = {
    category: ROUTES.CATEGORY,
    search: ROUTES.SEARCH,
    global: ROUTES.GLOBAL,
  };

  const route = typeMap[facetType];

  if (routeType === 'edit') {
    return route.FACETS.EDIT(id);
  }

  return route.FACETS.VALUES.EDIT(id);
};

export const getNewFacetRoute = (
  ruleType: 'categoryRanking' | 'searchRanking' | 'global'
): string => {
  const routeMap = {
    categoryRanking: ROUTES.CATEGORY.FACETS.NEW,
    searchRanking: ROUTES.SEARCH.FACETS.NEW,
    global: ROUTES.GLOBAL.FACETS.NEW,
  };

  return routeMap[ruleType];
};

export const getNewRulesetRoute = (
  ruleType: 'categoryRanking' | 'searchRanking' | 'global'
): string => {
  const routeMap = {
    categoryRanking: ROUTES.CATEGORY.RULESETS.NEW,
    searchRanking: ROUTES.SEARCH.RULESETS.NEW,
    global: ROUTES.GLOBAL.RULESETS.NEW,
  };

  return routeMap[ruleType];
};

export const getRulesetEditRoute = (
  ruleType: 'categoryRanking' | 'searchRanking' | 'global' | 'redirect',
  id: string
): string => {
  const routeMap = {
    categoryRanking: ROUTES.CATEGORY.RULESETS.EDIT,
    searchRanking: ROUTES.SEARCH.RULESETS.EDIT,
    global: ROUTES.GLOBAL.RULESETS.EDIT,
    redirect: ROUTES.SEARCH.REDIRECTS.EDIT,
  };

  return routeMap[ruleType](id);
};

export const getHistoryRoute = (
  ruleType: 'categoryRanking' | 'searchRanking' | 'global' | 'redirect',
  id: string,
  label: string
): string => {
  const routeMap = {
    categoryRanking: ROUTES.CATEGORY.HISTORY,
    searchRanking: ROUTES.SEARCH.HISTORY,
    global: ROUTES.GLOBAL.HISTORY,
    redirect: ROUTES.SEARCH.REDIRECTS.HISTORY,
  };

  return `${routeMap[ruleType](id)}/?identifier=${label}`;
};
