import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { Account } from '../../../../../models';
import { LoadAccounts, LoadAccountsWithoutAum } from './account.actions';

export interface State extends EntityState<Account> {
  loaded: boolean;
}

export const adapter: EntityAdapter<Account> = createEntityAdapter<Account>();

export const initialState: State = adapter.getInitialState({
  loaded: false
});


const featureReducer = createReducer(
  initialState,
  on(LoadAccounts, (state, { accounts }) => adapter.setAll(accounts, {
    ...state,
    loaded: true
  })),
  on(LoadAccountsWithoutAum, (state, { accounts }) => adapter.setAll(accounts, {
    ...state,
    loaded: true
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
