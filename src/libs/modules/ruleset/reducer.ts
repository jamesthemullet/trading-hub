import {
  AlphanumericBoostBury,
  IncludeExclude,
  NumericBoostBury,
  RuleSet,
} from '@/libs/api';
import { Action } from '@/libs/components/types';

export const rulesetReducer = (state: RuleSet, action: Action) => {
  const { rules } = state;
  switch (action.type) {
    case 'product': {
      const { payload } = action;
      const pinnedProducts = rules.pinnedProducts.filter(
        (product) => product.id !== payload.id
      );
      const blockedProducts = rules.blockedProducts.filter(
        (product) => product.id !== payload.id
      );
      const boostedProducts = rules.boosts.product.filter(
        (product) => product.id !== payload.id
      );
      const buriedProducts = rules.buries.product.filter(
        (product) => product.id !== payload.id
      );
      if (payload.change === 'add') {
        const product = { id: payload.id, weight: 100 };

        return {
          ...state,
          rules: {
            ...rules,
            pinnedProducts:
              payload.operation === 'pin' &&
              typeof payload.position === 'number'
                ? [
                    ...pinnedProducts.slice(0, payload.position),
                    { id: payload.id },
                    ...pinnedProducts.slice(payload.position),
                  ]
                : pinnedProducts,
            blockedProducts: [...blockedProducts].concat(
              payload.operation === 'block' ? product : []
            ),
            boosts: {
              ...rules.boosts,
              product: [...boostedProducts].concat(
                payload.operation === 'boost' ? product : []
              ),
            },
            buries: {
              ...rules.buries,
              product: [...buriedProducts].concat(
                payload.operation === 'bury' ? product : []
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

      const update = (values: NumericBoostBury[]) =>
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

      const update = (values: AlphanumericBoostBury[]) =>
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

      const update = (values: IncludeExclude[]) =>
        payload.change === 'remove'
          ? values.filter((_el, index) => index !== payload.index)
          : [...values, payload.data];

      return payload.operation === 'include'
        ? {
            ...state,
            rules: {
              ...rules,
              includes: {
                ...rules.includes,
                alphanumeric: update(rules.includes.alphanumeric || []),
              },
            },
          }
        : {
            ...state,
            rules: {
              ...rules,
              excludes: {
                ...rules.excludes,
                alphanumeric: update(rules.excludes.alphanumeric || []),
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
  }
};
