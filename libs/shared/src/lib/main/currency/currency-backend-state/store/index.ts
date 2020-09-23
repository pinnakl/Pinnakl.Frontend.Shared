import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import * as fromCurrency from './currency/currency.reducer';

export interface State {
  currency: fromCurrency.State;
}

export const reducers: ActionReducerMap<State> = {
  currency: fromCurrency.reducer
};

const selectCurrencyBackend = createFeatureSelector<State>('currencyBackend');

const selectCurrencyState = createSelector(
  selectCurrencyBackend,
  state => state.currency
);
export const selectAllCurrencies = createSelector(
  selectCurrencyState,
  fromCurrency.selectAll
);
export const selectCurrenciesLoaded = createSelector(
  selectCurrencyState,
  fromCurrency.selectLoaded
);
export const selectDefaultCurrencyId = createSelector(
  selectAllCurrencies,
  currencies => {
    if (!currencies || !currencies.length) {
      return null;
    }
    const usd = currencies.find(c => c.currency.toLowerCase() === 'usd');
    return usd ? usd.id : null;
  }
);
