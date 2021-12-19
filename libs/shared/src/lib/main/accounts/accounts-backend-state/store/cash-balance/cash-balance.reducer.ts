import { Action, createReducer, on } from '@ngrx/store';
import { CashBalance } from '../../../../../models';
import { LoadCashBalance } from './cash-balance.actions';

export interface State {
  loaded: boolean;
  cashBalance: CashBalance[];
}

export const initialState: State = {
  loaded: false,
  cashBalance: []
};

const featureReducer = createReducer(
  initialState,
  on(LoadCashBalance, (state, { cashBalance }) => ({
    ...state,
    loaded: true,
    cashBalance
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectAll = (state: State) => state.cashBalance;
export const selectLoaded = (state: State) => state.loaded;
