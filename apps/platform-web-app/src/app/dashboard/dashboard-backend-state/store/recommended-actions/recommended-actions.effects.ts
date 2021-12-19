import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import { RecommendedActionsService } from '../../../dashboard-backend/recommended-actions/recommended-actions.service';
import {
  AttemptLoadRecommendedActions,
  AttemptUpdateRecommendedAction,
  LoadRecommendedActions,
  LoadRecommendedActionsFailed,
  UpdateRecommendedAction,
  UpdateRecommendedActionFailed
} from './recommended-actions.actions';

@Injectable()
export class RecommendedActionEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly recommenedActionSvc: RecommendedActionsService
  ) { }

  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadRecommendedActions),
    concatMap(() =>
      this.recommenedActionSvc
        .get()
        .then(recommendedActions => LoadRecommendedActions({ recommendedActions }))
        .catch(error => LoadRecommendedActionsFailed({ error }))
    )
  ));

  update$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptUpdateRecommendedAction),
    concatMap(action =>
      this.recommenedActionSvc
        .put(action.recommendedAction)
        .then(
          recommendedAction => UpdateRecommendedAction({
            recommendedAction: {
              id: recommendedAction.id,
              changes: recommendedAction
            }
          })
        )
        .catch(error => UpdateRecommendedActionFailed({ error }))
    )
  ));
}
