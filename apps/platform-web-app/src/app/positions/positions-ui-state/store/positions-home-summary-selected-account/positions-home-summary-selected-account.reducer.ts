import { Action, createReducer, on } from '@ngrx/store';
import { SetSelectedAccountsWithoutAum } from './positions-home-summary-selected-account.actions';

export interface State {
  selectedAccountIds?: number[];
}

export const initialState: State = {
  selectedAccountIds: []
};

const featureReducer = createReducer(
  initialState,
  on(SetSelectedAccountsWithoutAum, (state, { payload }) => ({
    ...state,
    selectedAccountIds: [...payload.map(acc => parseInt(acc.id, 10))]
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const selectedAccountIds = (state: State) => state.selectedAccountIds;
