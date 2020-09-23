import { Action } from '@ngrx/store';
import { RecommendedAction } from '../../dashboard-backend';

export enum RecommendedActionProcessingActionTypes {
  ProcessRecommendedAction = '[ProcessRecommendedAction] Process Recommended Action'
}

export class ProcessRecommendedAction implements Action {
  readonly type =
    RecommendedActionProcessingActionTypes.ProcessRecommendedAction;
  constructor(public payload: RecommendedAction) {}
}

export type PnlFiltersUiActions = ProcessRecommendedAction;
