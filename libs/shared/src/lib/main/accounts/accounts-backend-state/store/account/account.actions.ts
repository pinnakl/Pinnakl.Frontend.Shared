import { Action } from '@ngrx/store';

import { Account } from '../../../../../models';

export enum AccountActionTypes {
  AttemptLoadAccounts = '[Account] Attempt Load Accounts',
  LoadAccounts = '[Account] Load Accounts',
  LoadAccountsFailed = '[Account] Load Accounts Failed'
}

export class AttemptLoadAccounts implements Action {
  readonly type = AccountActionTypes.AttemptLoadAccounts;
}

export class LoadAccounts implements Action {
  readonly type = AccountActionTypes.LoadAccounts;

  constructor(public payload: { accounts: Account[] }) {}
}

export class LoadAccountsFailed implements Action {
  readonly type = AccountActionTypes.LoadAccountsFailed;

  constructor(public payload: { error: any }) {}
}

export type AccountActions =
  | AttemptLoadAccounts
  | LoadAccounts
  | LoadAccountsFailed;
