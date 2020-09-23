import { Update } from '@ngrx/entity';
import { Action } from '@ngrx/store';

import { RecommendedAction } from '../../../dashboard-backend';
export enum RecommendedActionsActionTypes {
  AddRecommendedAction = '[RecommendedActions] Add RecommendedAction',
  AttemptLoadRecommendedActions = '[RecommendedActions] Attempt Load RecommendedActions',
  AttemptUpdateRecommendedAction = '[RecommendedActions] Attempt Update RecommendedAction',
  LoadRecommendedActions = '[RecommendedActions] Load RecommendedActions',
  LoadRecommendedActionsFailed = '[RecommendedActions] Load RecommendedActions Failed',
  SubscribeToDashboardRecommendedActions = '[RecommendedActions] Subscribe Recommended Actions',
  UnSubscribeToDashboardRecommendedActions = '[RecommendedActions] UnSubscribe Recommended Actions',
  UpdateRecommendedAction = '[RecommendedActions] Update RecommendedAction',
  UpdateRecommendedActionFailed = '[RecommendedActions] Update RecommendedAction Failed'
}

export class AddRecommendedAction implements Action {
  readonly type = RecommendedActionsActionTypes.AddRecommendedAction;

  constructor(public payload: { recommendedAction: RecommendedAction }) {}
}

export class AttemptLoadRecommendedActions implements Action {
  readonly type = RecommendedActionsActionTypes.AttemptLoadRecommendedActions;
}

export class AttemptUpdateRecommendedAction implements Action {
  readonly type = RecommendedActionsActionTypes.AttemptUpdateRecommendedAction;

  constructor(
    public payload: { recommendedAction: Partial<RecommendedAction> }
  ) {}
}

export class LoadRecommendedActions implements Action {
  readonly type = RecommendedActionsActionTypes.LoadRecommendedActions;

  constructor(public payload: { recommendedActions: RecommendedAction[] }) {}
}

export class UpdateRecommendedAction implements Action {
  readonly type = RecommendedActionsActionTypes.UpdateRecommendedAction;

  constructor(
    public payload: { recommendedAction: Update<RecommendedAction> }
  ) {}
}

export class LoadRecommendedActionsFailed implements Action {
  readonly type = RecommendedActionsActionTypes.LoadRecommendedActionsFailed;

  constructor(public payload: { error: any }) {}
}

export class UpdateRecommendedActionFailed implements Action {
  readonly type = RecommendedActionsActionTypes.UpdateRecommendedActionFailed;

  constructor(public payload: { error: any }) {}
}

export class SubscribeToDashboardRecommendedActions implements Action {
  readonly type =
    RecommendedActionsActionTypes.SubscribeToDashboardRecommendedActions;
}

export class UnSubscribeToDashboardRecommendedActions implements Action {
  readonly type =
    RecommendedActionsActionTypes.UnSubscribeToDashboardRecommendedActions;
}

export type RecommendedActionActions =
  | AddRecommendedAction
  | AttemptLoadRecommendedActions
  | AttemptUpdateRecommendedAction
  | LoadRecommendedActions
  | UpdateRecommendedAction
  | UpdateRecommendedActionFailed
  | LoadRecommendedActionsFailed;
