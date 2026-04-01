import type {
  MerchandisingAlphanumericBoostBury,
  MerchandisingIncludeExclude,
  MerchandisingNumericBoostBury,
  MerchandisingRuleSet,
} from '@/libs/api';
import type { RuleSetActions } from '@/libs/components/types';

export const rulesetReducer = (
  state: MerchandisingRuleSet,
  action: RuleSetActions
) => {
  const { rules } = state;
  switch (action.type) {
    case 'product': {
      const { payload } = action;
      const pinnedProducts = rules.pinnedProducts.filter(
        (product) => !payload.ids.includes(product.id)
      );
      const blockedProducts = rules.blockedProducts.filter(
        (product) => !payload.ids.includes(product.id)
      );
      const boostedProducts = rules.boosts.product.filter(
        (product) => !payload.ids.includes(product.id)
      );
      const buriedProducts = rules.buries.product.filter(
        (product) => !payload.ids.includes(product.id)
      );
      if (payload.change === 'add') {
        const products = payload.ids.map((id) => ({ id, weight: 100 }));

        return {
          ...state,
          rules: {
            ...rules,
            pinnedProducts:
              payload.operation === 'pin' &&
              typeof payload.position === 'number'
                ? [
                    ...pinnedProducts.slice(0, payload.position),
                    { id: payload.ids[0] },
                    ...pinnedProducts.slice(payload.position),
                  ]
                : pinnedProducts,
            blockedProducts: [...blockedProducts].concat(
              payload.operation === 'block' ? products : []
            ),
            boosts: {
              ...rules.boosts,
              product: [...boostedProducts].concat(
                payload.operation === 'boost' ? products : []
              ),
            },
            buries: {
              ...rules.buries,
              product: [...buriedProducts].concat(
                payload.operation === 'bury' ? products : []
              ),
            },
          },
        };
      }

      return {
        ...state,
        rules: {
          ...rules,
          pinnedProducts,
          blockedProducts,
          boosts: {
            ...rules.boosts,
            product: boostedProducts,
          },
          buries: {
            ...rules.buries,
            product: buriedProducts,
          },
        },
      };
    }
    case 'numericAttribute': {
      const { payload } = action;

      const update = (values: MerchandisingNumericBoostBury[]) =>
        payload.change === 'remove'
          ? values.filter((_el, index) => index !== payload.index)
          : payload.change === 'modify'
            ? values.map((attr, index) =>
                index === payload.index ? payload.data : attr
              )
            : [...values, payload.data];

      return payload.operation === 'boost'
        ? {
            ...state,
            rules: {
              ...rules,
              boosts: {
                ...rules.boosts,
                numeric: update(rules.boosts.numeric),
              },
            },
          }
        : {
            ...state,
            rules: {
              ...rules,
              buries: {
                ...rules.buries,
                numeric: update(rules.buries.numeric),
              },
            },
          };
    }
    case 'alphanumericBoostBuryAttribute': {
      const { payload } = action;

      const update = (values: MerchandisingAlphanumericBoostBury[]) => {
        switch (payload.change) {
          case 'remove':
            return values.filter((_el, index) => index !== payload.index);
          case 'modify':
            return values.map((attr, index) =>
              index === payload.index ? payload.data : attr
            );
          case 'add':
          default:
            return [...values, payload.data];
        }
      };

      return payload.operation === 'boost'
        ? {
            ...state,
            rules: {
              ...rules,
              boosts: {
                ...rules.boosts,
                alphanumeric: update(rules.boosts.alphanumeric),
              },
            },
          }
        : {
            ...state,
            rules: {
              ...rules,
              buries: {
                ...rules.buries,
                alphanumeric: update(rules.buries.alphanumeric),
              },
            },
          };
    }
    case 'alphanumericIncludeExcludeAttribute': {
      const { payload } = action;

      const update = (values: MerchandisingIncludeExclude[]) => {
        switch (payload.change) {
          case 'remove':
            return values.filter((_el, index) => index !== payload.index);
          case 'modify':
            return values.map((attr, index) =>
              index === payload.index ? payload.data : attr
            );
          case 'add':
          default:
            return [...values, payload.data];
        }
      };

      return payload.operation === 'include'
        ? {
            ...state,
            rules: {
              ...rules,
              includes: {
                ...rules.includes,
                alphanumeric: update(rules.includes.alphanumeric ?? []),
              },
            },
          }
        : {
            ...state,
            rules: {
              ...rules,
              excludes: {
                ...rules.excludes,
                alphanumeric: update(rules.excludes.alphanumeric ?? []),
              },
            },
          };
    }
    case 'dateTime': {
      const { payload } = action;

      return {
        ...state,
        startDate: payload.dateTime[0]
          ? new Date(payload.dateTime[0]).toISOString()
          : undefined,
        endDate: payload.dateTime[1]
          ? new Date(payload.dateTime[1]).toISOString()
          : undefined,
      };
    }
    case 'changeCountry': {
      const { payload } = action;

      return {
        ...state,
        countryCode: payload,
      };
    }
    case 'facetChangeDisplayType': {
      const { payload } = action;
      const { id, oldType, newType } = payload;

      const updatedFacets =
        oldType === 'included'
          ? state.facets?.filter((facet) => facet.id !== id)
          : state.facets;
      const facets =
        newType === 'included'
          ? [...updatedFacets!, { id, boosted: [], excludedValues: [] }]
          : updatedFacets;

      const updatedExcludedFacetsFacets =
        oldType === 'excluded'
          ? state.excludedFacets?.facets?.filter((facet) => facet.id !== id)
          : state.excludedFacets?.facets;
      const excludedFacetsFacets =
        newType === 'excluded'
          ? [...updatedExcludedFacetsFacets!, { id }]
          : updatedExcludedFacetsFacets;

      return {
        ...state,
        facets,
        excludedFacets: {
          facets: excludedFacetsFacets,
        },
      };
    }
    case 'facetChangePosition': {
      const { payload } = action;
      const { id, position } = payload;

      const facet = state.facets?.find((facet) => facet.id === id);
      const facets = state.facets!.filter((facet) => facet.id !== id);

      return {
        ...state,
        facets: facets.toSpliced(position, 0, facet!),
      };
    }

    case 'loadRuleset': {
      return action.payload;
    }
  }
};
