import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import * as fromTradeWorkflowSpec from './trade-workflow-spec';

export interface State {
  tradeWorkflowSpec: fromTradeWorkflowSpec.State;
}

export const reducers: ActionReducerMap<State> = {
  tradeWorkflowSpec: fromTradeWorkflowSpec.reducer
};

const selectFeature = createFeatureSelector<State>('tradeWorkflowSpecsBackend');

const selectTradeWorkflowSpec = createSelector(
  selectFeature,
  state => state.tradeWorkflowSpec
);

export const selectAllTradeWorkflowSpecs = createSelector(
  selectTradeWorkflowSpec,
  fromTradeWorkflowSpec.selectAll
);

export const selectTradeWorkflowSpecsLoaded = createSelector(
  selectTradeWorkflowSpec,
  fromTradeWorkflowSpec.selectLoaded
);

export {
  AttemptLoadTradeWorkflowSpecs,
  TradeWorkflowSpecEffects
} from './trade-workflow-spec';

export { LoadTradeWorkflowSpecs } from './trade-workflow-spec';
