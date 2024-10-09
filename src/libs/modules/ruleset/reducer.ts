import {
  AlphanumericBoostBury,
  IncludeExclude,
  MerchandisingRules,
  NumericBoostBury,
} from '@/libs/api';
import { Action } from '@/libs/components/types';

export const rulesetReducer = (state: MerchandisingRules, action: Action) => {
  switch (action.type) {
    case 'product': {
      const { payload } = action;
      const pinnedProducts = state.pinnedProducts.filter(
        (product) => product.id !== payload.id
      );
      const blockedProducts = state.blockedProducts.filter(
        (product) => product.id !== payload.id
      );
      const boostedProducts = state.boosts.product.filter(
        (product) => product.id !== payload.id
      );
      const buriedProducts = state.buries.product.filter(
        (product) => product.id !== payload.id
      );
      if (payload.change === 'add') {
        const product = { id: payload.id, weight: 100 };

        return {
          ...state,
          pinnedProducts:
            payload.operation === 'pin' && typeof payload.position === 'number'
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
            ...state.boosts,
            product: [...boostedProducts].concat(
              payload.operation === 'boost' ? product : []
            ),
          },
          buries: {
            ...state.buries,
            product: [...buriedProducts].concat(
              payload.operation === 'bury' ? product : []
            ),
          },
        };
      }

      return {
        ...state,
        pinnedProducts,
        blockedProducts,
        boosts: {
          ...state.boosts,
          product: boostedProducts,
        },
        buries: {
          ...state.buries,
          product: buriedProducts,
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
            boosts: {
              ...state.boosts,
              numeric: update(state.boosts.numeric),
            },
          }
        : {
            ...state,
            buries: {
              ...state.buries,
              numeric: update(state.buries.numeric),
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
            boosts: {
              ...state.boosts,
              alphanumeric: update(state.boosts.alphanumeric),
            },
          }
        : {
            ...state,
            buries: {
              ...state.buries,
              alphanumeric: update(state.buries.alphanumeric),
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
            includes: {
              ...state.includes,
              alphanumeric: update(state.includes.alphanumeric || []),
            },
          }
        : {
            ...state,
            excludes: {
              ...state.excludes,
              alphanumeric: update(state.excludes.alphanumeric || []),
            },
          };
    }
  }
};
