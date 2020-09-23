import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { concatMap, map, takeUntil, tap } from 'rxjs/operators';

import { RecommendedActionsService } from '../../../dashboard-backend/recommended-actions';
import {
  AddRecommendedAction,
  AttemptUpdateRecommendedAction,
  LoadRecommendedActions,
  LoadRecommendedActionsFailed,
  RecommendedActionsActionTypes,
  UpdateRecommendedAction,
  UpdateRecommendedActionFailed
} from './recommended-actions.actions';

@Injectable()
export class RecommendedActionEffects {
  constructor(
    private actions$: Actions,
    private recommenedActionSvc: RecommendedActionsService
  ) {}

  @Effect()
  load$ = this.actions$.pipe(
    ofType(RecommendedActionsActionTypes.AttemptLoadRecommendedActions),
    concatMap(() =>
      this.recommenedActionSvc
        .get()
        .then(
          recommendedActions =>
            new LoadRecommendedActions({ recommendedActions })
        )
        .catch(error => new LoadRecommendedActionsFailed({ error }))
    )
  );

  @Effect()
  update$ = this.actions$.pipe(
    ofType(RecommendedActionsActionTypes.AttemptUpdateRecommendedAction),
    concatMap((action: AttemptUpdateRecommendedAction) =>
      this.recommenedActionSvc
        .put(action.payload.recommendedAction)
        .then(
          recommendedAction =>
            new UpdateRecommendedAction({
              recommendedAction: {
                id: recommendedAction.id,
                changes: recommendedAction
              }
            })
        )
        .catch(error => new UpdateRecommendedActionFailed({ error }))
    )
  );
}
