import { search } from '@/libs/api';
import type { MerchandisingCountryCode } from '@/libs/api/generated/open-api';

import { handleError } from '../utils/error';
import type { Action } from './reducer';

const toCatalogue = (market: MerchandisingCountryCode) =>
  market === 'IE' ? 'MANDSIE' : 'MANDSUK';

export const useFetchProductStatus = (
  dispatch: React.Dispatch<Action>
): ((productId: string, market: MerchandisingCountryCode) => Promise<void>) => {
  const fetchProductStatus = async (
    productId: string,
    market: MerchandisingCountryCode
  ) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await search().getProductDiagnostics({
        productId,
        catalogue: toCatalogue(market),
      });
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: result.data,
        submittedQuery: productId,
      });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: handleError(err) });
    }
  };

  return fetchProductStatus;
};
