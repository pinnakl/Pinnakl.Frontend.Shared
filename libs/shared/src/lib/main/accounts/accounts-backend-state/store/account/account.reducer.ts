import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { Account } from '../../../../../models';
import { AccountActions, AccountActionTypes } from './account.actions';

export interface State extends EntityState<Account> {
  loaded: boolean;
}

export const adapter: EntityAdapter<Account> = createEntityAdapter<Account>();

export const initialState: State = adapter.getInitialState({
  loaded: false
});

export function reducer(
  state: State = initialState,
  action: AccountActions
): State {
  switch (action.type) {
    case AccountActionTypes.LoadAccounts: {
      return adapter.addAll(action.payload.accounts, {
        ...state,
        loaded: true
      });
    }
    default: {
      return state;
    }
  }
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
