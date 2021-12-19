import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { RecommendedAction } from '../../../dashboard-backend/recommended-actions/recommended-action.model';

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


export const AddRecommendedAction = createAction(
  RecommendedActionsActionTypes.AddRecommendedAction,
  props<{ recommendedAction: RecommendedAction }>()
);

export const AttemptLoadRecommendedActions = createAction(
  RecommendedActionsActionTypes.AttemptLoadRecommendedActions
);

export const AttemptUpdateRecommendedAction = createAction(
  RecommendedActionsActionTypes.AttemptUpdateRecommendedAction,
  props<{ recommendedAction: Partial<RecommendedAction> }>()
);

export const LoadRecommendedActions = createAction(
  RecommendedActionsActionTypes.LoadRecommendedActions,
  props<{ recommendedActions: RecommendedAction[] }>()
);

export const UpdateRecommendedAction = createAction(
  RecommendedActionsActionTypes.UpdateRecommendedAction,
  props<{ recommendedAction: Update<RecommendedAction> }>()
);

export const LoadRecommendedActionsFailed = createAction(
  RecommendedActionsActionTypes.LoadRecommendedActionsFailed,
  props<{ error: any }>()
);

export const UpdateRecommendedActionFailed = createAction(
  RecommendedActionsActionTypes.UpdateRecommendedActionFailed,
  props<{ error: any }>()
);

export const SubscribeToDashboardRecommendedActions = createAction(
  RecommendedActionsActionTypes.SubscribeToDashboardRecommendedActions
);

export const UnSubscribeToDashboardRecommendedActions = createAction(
  RecommendedActionsActionTypes.UnSubscribeToDashboardRecommendedActions
);
