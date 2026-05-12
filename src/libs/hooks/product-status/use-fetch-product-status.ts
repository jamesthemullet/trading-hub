import { search } from '@/libs/api';

import { handleError } from '../utils/error';
import type { Action } from './reducer';

export const useFetchProductStatus = (dispatch: React.Dispatch<Action>) => {
  const fetchProductStatus = async (productId: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await search().betaMerchandisingProductDiagnosticsList({
        productId,
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
