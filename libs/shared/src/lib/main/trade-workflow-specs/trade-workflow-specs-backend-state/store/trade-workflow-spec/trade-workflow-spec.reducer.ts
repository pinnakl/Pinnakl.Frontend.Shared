import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { TradeWorkflowSpec } from '../../../trade-workflow-specs-backend';
import {
  AttemptLoadTradeWorkflowSpecs,
  LoadTradeWorkflowSpecs,
  LoadTradeWorkflowSpecsFailed
} from './trade-workflow-spec.actions';

export interface State extends EntityState<TradeWorkflowSpec> {
  loaded: boolean;
  loading: boolean;
}

export const adapter: EntityAdapter<TradeWorkflowSpec> = createEntityAdapter<
  TradeWorkflowSpec
>();

export const initialState: State = adapter.getInitialState({
  loaded: false,
  loading: false
});

const featureReducer = createReducer(
  initialState,
  on(AttemptLoadTradeWorkflowSpecs, (state) => ({
    ...state,
    loaded: false,
    loading: true
  })),
  on(LoadTradeWorkflowSpecs, (state, { tradeWorkflowSpecs }) => adapter.setAll(tradeWorkflowSpecs, {
    ...state,
    loaded: true,
    loading: false
  })),
  on(LoadTradeWorkflowSpecsFailed, (state) => ({
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
