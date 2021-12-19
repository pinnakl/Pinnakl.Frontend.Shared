import { createAction, props } from '@ngrx/store';
import { RecommendedAction } from '../../dashboard-backend/recommended-actions/recommended-action.model';

export enum RecommendedActionProcessingActionTypes {
  ProcessRecommendedAction = '[ProcessRecommendedAction] Process Recommended Action'
}


export const ProcessRecommendedAction = createAction(
  RecommendedActionProcessingActionTypes.ProcessRecommendedAction,
  props<{ payload: RecommendedAction }>()
);
