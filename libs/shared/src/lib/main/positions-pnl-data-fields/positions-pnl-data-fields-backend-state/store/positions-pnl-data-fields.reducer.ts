import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { PositionsPnlDataField } from '../../positions-pnl-data-fields-backend';
import {
  AttemptLoadPositionsPnlDataFields,
  LoadPositionsPnlDataFields,
  LoadPositionsPnlDataFieldsFailed
} from './positions-pnl-data-fields.actions';

export interface State extends EntityState<PositionsPnlDataField> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<
  PositionsPnlDataField
> = createEntityAdapter<PositionsPnlDataField>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadPositionsPnlDataFields, (state) => ({
    ...state,
    loaded: false,
    loading: true
  })),
  on(LoadPositionsPnlDataFields, (state, { positionsPnlDataFields }) => adapter.setAll(positionsPnlDataFields, {
    ...state,
    loaded: true,
    loading: false
  })),
  on(LoadPositionsPnlDataFieldsFailed, (state) => ({
    ...state,
    loaded: false,
    loading: false
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return featureReducer(state, action);
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
