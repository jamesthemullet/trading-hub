import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';

type State = {
  query: string;
  data: BetaMerchandisingProductDiagnosticsListData | null;
  isLoading: boolean;
  error: string;
};

export type Action =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'FETCH_START' }
  | {
      type: 'FETCH_SUCCESS';
      payload: BetaMerchandisingProductDiagnosticsListData;
    }
  | { type: 'FETCH_ERROR'; payload: string };

export const initialState: State = {
  query: '',
  data: null,
  isLoading: false,
  error: '',
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'FETCH_START':
      return { ...state, data: null, isLoading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, data: action.payload, isLoading: false, error: '' };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
  }
};
