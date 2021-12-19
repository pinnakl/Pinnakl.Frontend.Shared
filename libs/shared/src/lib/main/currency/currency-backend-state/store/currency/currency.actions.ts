import { createAction, props } from '@ngrx/store';

import { CurrencyForOMS } from '../../../../../models/oms';

export enum CurrencyActionTypes {
  AttemptLoadCurrencies = '[Currency] Attempt Load Currencies',
  LoadCurrencies = '[Currency] Load Currencies',
  LoadCurrenciesFailed = '[Currency] Load Currencies Failed'
}

export const AttemptLoadCurrencies = createAction(
  CurrencyActionTypes.AttemptLoadCurrencies
);

export const LoadCurrencies = createAction(
  CurrencyActionTypes.LoadCurrencies,
  props<{ currencies: CurrencyForOMS[] }>()
);

export const LoadCurrenciesFailed = createAction(
  CurrencyActionTypes.LoadCurrenciesFailed,
  props<{ error: any }>()
);
