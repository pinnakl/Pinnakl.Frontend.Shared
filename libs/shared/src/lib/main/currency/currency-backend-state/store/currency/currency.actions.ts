import { Action } from '@ngrx/store';

import { CurrencyForOMS } from '../../../../../models/oms/currency.model';

export enum CurrencyActionTypes {
  AttemptLoadCurrencies = '[Currency] Attempt Load Currencies',
  LoadCurrencies = '[Currency] Load Currencies',
  LoadCurrenciesFailed = '[Currency] Load Currencies Failed'
}

export class AttemptLoadCurrencies implements Action {
  readonly type = CurrencyActionTypes.AttemptLoadCurrencies;
}

export class LoadCurrencies implements Action {
  readonly type = CurrencyActionTypes.LoadCurrencies;

  constructor(public payload: { currencies: CurrencyForOMS[] }) {}
}

export class LoadCurrenciesFailed implements Action {
  readonly type = CurrencyActionTypes.LoadCurrenciesFailed;

  constructor(public payload: { error: any }) {}
}

export type CurrencyActions =
  | AttemptLoadCurrencies
  | LoadCurrencies
  | LoadCurrenciesFailed;
