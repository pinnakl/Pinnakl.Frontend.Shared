import { Action, createReducer, on } from '@ngrx/store';
import { AddCashData } from './cash-data.actions';

export interface CashDataState {
  accountId: number;
  cashToday: number;
  cashYesterday: number;
}

export interface State {
  cashData: CashDataState[];
}

export const initialState: State = {
  cashData: []
};

const featureReducer = createReducer(
  initialState,
  on(AddCashData, (state, { payload }) => addCashData(state, payload))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

function addCashData(stateCopy: State, cashData: CashDataState): State {
  let updatedCashData = [...stateCopy.cashData];
  if (stateCopy.cashData.map(data => data.accountId).includes(cashData.accountId)) {
    updatedCashData = updatedCashData.map(data => {
      if (data.accountId === cashData.accountId) {
        data = cashData;
      }
      return data;
    });
  } else {
    updatedCashData.push(cashData);
  }
  return { ...stateCopy, cashData: updatedCashData };
}

export const selectCashData = (state: State) => state.cashData;
