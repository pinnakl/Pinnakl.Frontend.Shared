import { createAction, props } from '@ngrx/store';
import { CurrencyForOMS } from '@pnkl-frontend/shared';

export enum SelectedCurrencyActionTypes {
  AttemptLoadSelectedCurrency = '[SelectedCurrency] Attempt Load SelectedCurrency',
  LoadSelectedCurrency = '[SelectedCurrency] Load SelectedCurrency',
  LoadSelectedCurrencyFailed = '[SelectedCurrency] Load SelectedCurrency Failed'
}


export const AttemptLoadSelectedCurrency = createAction(
  SelectedCurrencyActionTypes.AttemptLoadSelectedCurrency,
  props<{ date: Date; currency: CurrencyForOMS }>()
);

export const LoadSelectedCurrency = createAction(
  SelectedCurrencyActionTypes.LoadSelectedCurrency,
  props<{ payload: { currencyId: number; fxRate: number } }>()
);

export const LoadSelectedCurrencyFailed = createAction(
  SelectedCurrencyActionTypes.LoadSelectedCurrencyFailed,
  props<{ error: any }>()
);
