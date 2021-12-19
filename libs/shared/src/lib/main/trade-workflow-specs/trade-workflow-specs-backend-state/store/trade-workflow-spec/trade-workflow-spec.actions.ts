import { createAction, props } from '@ngrx/store';

import { TradeWorkflowSpec } from '../../../trade-workflow-specs-backend';

export enum TradeWorkflowSpecActionTypes {
  AttemptLoadTradeWorkflowSpecs = '[TradeWorkflowSpec] Attempt Load TradeWorkflowSpecs',
  LoadTradeWorkflowSpecs = '[TradeWorkflowSpec] Load TradeWorkflowSpecs',
  LoadTradeWorkflowSpecsFailed = '[TradeWorkflowSpec] Load TradeWorkflowSpecs Failed'
}

export const AttemptLoadTradeWorkflowSpecs = createAction(
  TradeWorkflowSpecActionTypes.AttemptLoadTradeWorkflowSpecs
);

export const LoadTradeWorkflowSpecs = createAction(
  TradeWorkflowSpecActionTypes.LoadTradeWorkflowSpecs,
  props<{ tradeWorkflowSpecs: TradeWorkflowSpec[] }>()
);

export const LoadTradeWorkflowSpecsFailed = createAction(
  TradeWorkflowSpecActionTypes.LoadTradeWorkflowSpecsFailed,
  props<{ error: any }>()
);
