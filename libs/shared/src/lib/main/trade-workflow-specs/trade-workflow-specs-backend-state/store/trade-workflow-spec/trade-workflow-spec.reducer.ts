import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import { TradeWorkflowSpec } from '../../../trade-workflow-specs-backend';
import {
  TradeWorkflowSpecActions,
  TradeWorkflowSpecActionTypes
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

export function reducer(
  state: State = initialState,
  action: TradeWorkflowSpecActions
): State {
  switch (action.type) {
    case TradeWorkflowSpecActionTypes.AttemptLoadTradeWorkflowSpecs: {
      return {
        ...state,
        loaded: false,
        loading: true
      };
    }
    case TradeWorkflowSpecActionTypes.LoadTradeWorkflowSpecs: {
      return adapter.addAll(action.payload.tradeWorkflowSpecs, {
        ...state,
        loaded: true,
        loading: false
      });
    }
    case TradeWorkflowSpecActionTypes.LoadTradeWorkflowSpecsFailed: {
      return {
        ...state,
        loaded: false,
        loading: false
      };
    }
    default: {
      return state;
    }
  }
}

export const { selectAll } = adapter.getSelectors();
export const selectLoaded = (state: State) => state.loaded;
