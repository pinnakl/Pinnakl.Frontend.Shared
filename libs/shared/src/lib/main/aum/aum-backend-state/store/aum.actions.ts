import { createAction, props } from '@ngrx/store';

export enum AumActionTypes {
  AttemptLoadAum = '[Aum] Attempt Load Aum',
  LoadAum = '[Aum] Load Aum',
  LoadFullAum = '[Aum] Load Full Aum',
  LoadAccountsAum = '[Aum] Load Accounts Aum',
  LoadAumFailed = '[Aum] Load Aum Failed'
}

export const AttemptLoadAum = createAction(
  AumActionTypes.AttemptLoadAum,
  props<{ accountId: number; date: Date }>()
);

export const LoadAum = createAction(
  AumActionTypes.LoadAum,
  props<{ aum: number }>()
);

export const LoadFullAum = createAction(
  AumActionTypes.LoadFullAum,
  props<{ accountId: number; date: Date, aum: number }>()
);

export const LoadAccountsAum = createAction(
  AumActionTypes.LoadAccountsAum,
  props<{ payload: { accountId: number; aum: number }[] }>()
);

export const LoadAumFailed = createAction(
  AumActionTypes.LoadAumFailed,
  props<{ error: any }>()
);
