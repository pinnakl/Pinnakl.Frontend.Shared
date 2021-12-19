import { createAction, props } from '@ngrx/store';

export enum CashDataTypes {
  AddCashData = '[CashData] Add cash data'
}


export const AddCashData = createAction(
  CashDataTypes.AddCashData,
  props<{ payload: { cashToday: number, cashYesterday: number, accountId: number } }>()
);
