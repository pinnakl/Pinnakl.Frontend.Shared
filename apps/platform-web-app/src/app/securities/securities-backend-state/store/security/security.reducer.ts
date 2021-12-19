import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { Security } from '@pnkl-frontend/shared';
import { AttemptLoadSecurities, LoadSecurities, LoadSecuritiesFailed } from './security.actions';

export interface State extends EntityState<Security> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<Security> = createEntityAdapter<Security>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadSecurities, (state) => ({ ...state, loaded: false, loading: true })),
  on(LoadSecurities, (state, { securities }) => adapter.setAll(securities, {
    ...state,
    loaded: true,
    loading: false
  })),
  on(LoadSecuritiesFailed, (state) => ({ ...state, loaded: false, loading: false }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
