import { Action } from '@ngrx/store';

export enum AumActionTypes {
  AttemptLoadAum = '[Aum] Attempt Load Aum',
  LoadAum = '[Aum] Load Aum',
  LoadAccountsAum = '[Aum] Load Accounts Aum',
  LoadAumFailed = '[Aum] Load Aum Failed'
}

export class AttemptLoadAum implements Action {
  readonly type = AumActionTypes.AttemptLoadAum;
  constructor(public payload: { accountId: number; date: Date }) {}
}

export class LoadAum implements Action {
  readonly type = AumActionTypes.LoadAum;
  constructor(public payload: { aum: number }) {}
}

export class LoadAccountsAum implements Action {
  readonly type = AumActionTypes.LoadAccountsAum;
  constructor(public payload: { accountId: number; aum: number }[]) {}
}

export class LoadAumFailed implements Action {
  readonly type = AumActionTypes.LoadAumFailed;
  constructor(public payload: { error: any }) {}
}

export type AumActions = AttemptLoadAum | LoadAum | LoadAccountsAum | LoadAumFailed;
