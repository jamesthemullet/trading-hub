import type { MerchandisingRuleSet } from '@/libs/api';
import type { RuleSetActions } from '@/libs/components/types';

type CollectionChangePayload<T> = {
  change: 'add' | 'modify' | 'remove';
  index: number;
  data: T;
};

// Applies an add/modify/remove change to a boost/bury/include/exclude
// attribute collection, shared by every attribute-type action below.
const updateCollectionByChange = <T>(
  values: T[],
  { change, index, data }: CollectionChangePayload<T>
): T[] => {
  switch (change) {
    case 'remove':
      return values.filter((_el, valueIndex) => valueIndex !== index);
    case 'modify':
      return values.map((value, valueIndex) =>
        valueIndex === index ? data : value
      );
    case 'add':
    default:
      return [...values, data];
  }
};

export const rulesetReducer = (
  state: MerchandisingRuleSet,
  action: RuleSetActions
): MerchandisingRuleSet => {
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
        const products = payload.ids.map((id) => ({
          id,
          weight: payload.weight ?? 100,
        }));

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

      return payload.operation === 'boost'
        ? {
            ...state,
            rules: {
              ...rules,
              boosts: {
                ...rules.boosts,
                numeric: updateCollectionByChange(
                  rules.boosts.numeric,
                  payload
                ),
              },
            },
          }
        : {
            ...state,
            rules: {
              ...rules,
              buries: {
                ...rules.buries,
                numeric: updateCollectionByChange(
                  rules.buries.numeric,
                  payload
                ),
              },
            },
          };
    }
    case 'alphanumericBoostBuryAttribute': {
      const { payload } = action;

      return payload.operation === 'boost'
        ? {
            ...state,
            rules: {
              ...rules,
              boosts: {
                ...rules.boosts,
                alphanumeric: updateCollectionByChange(
                  rules.boosts.alphanumeric,
                  payload
                ),
              },
            },
          }
        : {
            ...state,
            rules: {
              ...rules,
              buries: {
                ...rules.buries,
                alphanumeric: updateCollectionByChange(
                  rules.buries.alphanumeric,
                  payload
                ),
              },
            },
          };
    }
    case 'alphanumericIncludeExcludeAttribute': {
      const { payload } = action;

      return payload.operation === 'include'
        ? {
            ...state,
            rules: {
              ...rules,
              includes: {
                ...rules.includes,
                alphanumeric: updateCollectionByChange(
                  rules.includes.alphanumeric ?? [],
                  payload
                ),
              },
            },
          }
        : {
            ...state,
            rules: {
              ...rules,
              excludes: {
                ...rules.excludes,
                alphanumeric: updateCollectionByChange(
                  rules.excludes.alphanumeric ?? [],
                  payload
                ),
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
