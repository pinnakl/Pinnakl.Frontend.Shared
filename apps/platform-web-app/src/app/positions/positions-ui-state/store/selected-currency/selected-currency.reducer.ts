import { Action, createReducer, on } from '@ngrx/store';
import {
  AttemptLoadSelectedCurrency,
  LoadSelectedCurrency,
  LoadSelectedCurrencyFailed
} from './selected-currency.actions';

export interface State {
  loaded: boolean;
  loading: boolean;
  selectedCurrency: { currencyId: number; fxRate: number };
}

export const initialState: State = {
  loaded: false,
  loading: false,
  selectedCurrency: null
};

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadSelectedCurrency, (state) => ({ ...state, loaded: false, loading: true })),
  on(LoadSelectedCurrency, (state, { payload }) => ({
    ...state,
    loaded: true,
    loading: false,
    selectedCurrency: payload
  })),
  on(LoadSelectedCurrencyFailed, (state) => ({ ...state, loaded: false, loading: false }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectedCurrency = (state: State) => state.selectedCurrency;
