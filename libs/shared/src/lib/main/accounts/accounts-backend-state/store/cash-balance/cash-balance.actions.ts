import { Action } from '@ngrx/store';

import { Account, CashBalance } from '../../../../../models';

export enum CashBalanceActionTypes {
  AttemptLoadCashBalance = '[Account] Attempt Load Cash Balance',
  LoadCashBalance = '[Account] Load Cash Balance',
  LoadCashBalanceFailed = '[Account] Load Cash Balance Failed'
}

export class AttemptLoadCashBalance implements Action {
  readonly type = CashBalanceActionTypes.AttemptLoadCashBalance;
}

export class LoadCashBalance implements Action {
  readonly type = CashBalanceActionTypes.LoadCashBalance;

  constructor(public payload: { cashBalance: CashBalance[] }) {}
}

export class LoadCashBalanceFailed implements Action {
  readonly type = CashBalanceActionTypes.LoadCashBalanceFailed;

  constructor(public payload: { error: any }) {}
}

export type CashBalanceActions =
  | AttemptLoadCashBalance
  | LoadCashBalance
  | LoadCashBalanceFailed;
