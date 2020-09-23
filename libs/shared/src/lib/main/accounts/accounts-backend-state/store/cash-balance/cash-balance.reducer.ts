import { CashBalance } from '../../../../../models';
import { CashBalanceActions, CashBalanceActionTypes } from './cash-balance.actions';

export interface State {
  loaded: boolean;
  cashBalance: CashBalance[];
}

export const initialState: State = {
  loaded: false,
  cashBalance: []
};

export function reducer(
  state: State = initialState,
  action: CashBalanceActions
): State {
  switch (action.type) {
    case CashBalanceActionTypes.LoadCashBalance: {
      return {
        ...state,
        loaded: true,
        cashBalance: action.payload.cashBalance
      };
    }
    default: {
      return state;
    }
  }
}

export const selectAll = (state: State) => state.cashBalance;
export const selectLoaded = (state: State) => state.loaded;
