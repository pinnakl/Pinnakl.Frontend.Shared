import {
  BackendConnectionActions,
  BackendConnectionActionTypes
} from './backend-connection.actions';

import { createFeatureSelector, createSelector } from '@ngrx/store';

export interface State {
  reconnectedAt?: Date;
}

export const initialState: State = {
  reconnectedAt: null
};

export function reducer(
  state: State = initialState,
  action: BackendConnectionActions
): State {
  switch (action.type) {
    case BackendConnectionActionTypes.SetReconnectedAt: {
      return { ...initialState, reconnectedAt: action.payload.reconnectedAt };
    }
    default:
      return state;
  }
}

const selectReconnectedAt = (state: State) => state.reconnectedAt;

const selectBackendConnection = createFeatureSelector<State>(
  'backendConnection'
);

export const selectBackendReconnectedAt = createSelector(
  selectBackendConnection,
  selectReconnectedAt
);
