import { createAction, props } from '@ngrx/store';
import { Account } from '../../../../../models';

export enum AccountActionTypes {
  AttemptLoadAccounts = '[Account] Attempt Load Accounts',
  LoadAccounts = '[Account] Load Accounts',
  LoadAccountsWithoutAum = '[Account] Load Accounts without aum',
  LoadAccountsFailed = '[Account] Load Accounts Failed'
}

export const AttemptLoadAccounts = createAction(
  AccountActionTypes.AttemptLoadAccounts
);

export const LoadAccounts = createAction(
  AccountActionTypes.LoadAccounts,
  props<{ accounts: Account[] }>()
);

export const LoadAccountsWithoutAum = createAction(
  AccountActionTypes.LoadAccountsWithoutAum,
  props<{ accounts: Account[] }>()
);

export const LoadAccountsFailed = createAction(
  AccountActionTypes.LoadAccountsFailed,
  props<{ error: any }>()
);
