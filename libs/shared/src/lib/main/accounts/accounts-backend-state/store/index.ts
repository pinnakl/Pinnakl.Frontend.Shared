import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import * as fromAccount from './account/account.reducer';
import * as fromCashBalance from './cash-balance/cash-balance.reducer';

export interface State {
  account: fromAccount.State;
  cashBalance: fromCashBalance.State;
}

export const reducers: ActionReducerMap<State> = {
  account: fromAccount.reducer,
  cashBalance: fromCashBalance.reducer
};

const selectAccountsBackend = createFeatureSelector<State>('accountsBackend');

const selectAccountState = createSelector(
  selectAccountsBackend,
  state => state.account
);
export const selectAllAccounts = createSelector(
  selectAccountState,
  fromAccount.selectAll
);
export const selectAccountsLoaded = createSelector(
  selectAccountState,
  fromAccount.selectLoaded
);

const selectCashBalanceState = createSelector(
  selectAccountsBackend,
  state => state.cashBalance
);
export const selectAllCashBalance = createSelector(
  selectCashBalanceState,
  fromCashBalance.selectAll
);
export const selectCashBalanceLoaded = createSelector(
  selectCashBalanceState,
  fromCashBalance.selectLoaded
);
