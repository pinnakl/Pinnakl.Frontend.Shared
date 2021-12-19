import { createAction, props } from '@ngrx/store';
import { CashBalance } from '../../../../../models';

export enum CashBalanceActionTypes {
  AttemptLoadCashBalance = '[Account] Attempt Load Cash Balance',
  LoadCashBalance = '[Account] Load Cash Balance',
  LoadCashBalanceFailed = '[Account] Load Cash Balance Failed'
}

export const AttemptLoadCashBalance = createAction(
  CashBalanceActionTypes.AttemptLoadCashBalance
);

export const LoadCashBalance = createAction(
  CashBalanceActionTypes.LoadCashBalance,
  props<{ cashBalance: CashBalance[] }>()
);

export const LoadCashBalanceFailed = createAction(
  CashBalanceActionTypes.LoadCashBalanceFailed,
  props<{ error: any }>()
);
