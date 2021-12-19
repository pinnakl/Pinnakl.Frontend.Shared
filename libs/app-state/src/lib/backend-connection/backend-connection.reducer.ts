import { Action, createReducer, on } from '@ngrx/store';
import { SetReconnectedAt } from './backend-connection.actions';

import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface State {
  reconnectedAt?: Date;
}

export const initialState: State = {
  reconnectedAt: null
};

const featureReducer = createReducer(
  initialState,
  on(SetReconnectedAt, (state, { reconnectedAt }) => ({ ...state, reconnectedAt }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

const selectReconnectedAt = (state: State) => state.reconnectedAt;

const selectBackendConnection = createFeatureSelector<State>(
  'backendConnection'
);

export const selectBackendReconnectedAt = createSelector(
  selectBackendConnection,
  selectReconnectedAt
);
