import { Action } from '@ngrx/store';

import { TradeWorkflowSpec } from '../../../trade-workflow-specs-backend';

export enum TradeWorkflowSpecActionTypes {
  AttemptLoadTradeWorkflowSpecs = '[TradeWorkflowSpec] Attempt Load TradeWorkflowSpecs',
  LoadTradeWorkflowSpecs = '[TradeWorkflowSpec] Load TradeWorkflowSpecs',
  LoadTradeWorkflowSpecsFailed = '[TradeWorkflowSpec] Load TradeWorkflowSpecs Failed'
}

export class AttemptLoadTradeWorkflowSpecs implements Action {
  readonly type = TradeWorkflowSpecActionTypes.AttemptLoadTradeWorkflowSpecs;
}

export class LoadTradeWorkflowSpecs implements Action {
  readonly type = TradeWorkflowSpecActionTypes.LoadTradeWorkflowSpecs;

  constructor(public payload: { tradeWorkflowSpecs: TradeWorkflowSpec[] }) {}
}

export class LoadTradeWorkflowSpecsFailed implements Action {
  readonly type = TradeWorkflowSpecActionTypes.LoadTradeWorkflowSpecsFailed;

  constructor(public payload: { error: any }) {}
}

export type TradeWorkflowSpecActions =
  | AttemptLoadTradeWorkflowSpecs
  | LoadTradeWorkflowSpecs
  | LoadTradeWorkflowSpecsFailed;
