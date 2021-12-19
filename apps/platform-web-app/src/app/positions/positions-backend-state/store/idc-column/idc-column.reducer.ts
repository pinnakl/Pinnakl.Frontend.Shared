import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { IdcColumn } from '@pnkl-frontend/shared';
import { AttemptLoadIdcColumns, LoadIdcColumns, LoadIdcColumnsFailed } from './idc-column.actions';

export interface State extends EntityState<IdcColumn> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<IdcColumn> = createEntityAdapter<
  IdcColumn
>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadIdcColumns, (state) => ({ ...state, loaded: false, loading: true })),
  on(LoadIdcColumns, (state, { idcColumns }) => adapter.setAll(idcColumns, {
    ...state,
    loaded: true,
    loading: false
  })),
  on(LoadIdcColumnsFailed, (state) => ({ ...state, loaded: false, loading: false }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectEntities, selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
