import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatMap } from 'rxjs/operators';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { Utility } from '@pnkl-frontend/shared';
import { AttemptUpdateRecommendedAction } from '../../dashboard-backend-state/store/recommended-actions';
import { RecommendedActionsProcessingService } from '../../dashboard-backend/recommended-actions-processing/recommended-actions-processing.service';
import { ProcessRecommendedAction } from './recommended-actions-processing.actions';

@Injectable()
export class RecommendedActionProcessingEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly pnklSpinner: PinnaklSpinner,
    private readonly recommendedActionProcessingSvc: RecommendedActionsProcessingService,
    private readonly store: Store<any>,
    private readonly toastr: Toastr,
    private readonly utility: Utility
  ) { }

  processAction$ = createEffect(() => this.actions$.pipe(
    ofType(ProcessRecommendedAction),
    concatMap(action => {
      this.pnklSpinner.spin();
      return this.recommendedActionProcessingSvc
        .process(action.payload)
        .then(() => {
          this.pnklSpinner.stop();
          this.toastr.success('Action Processed');
          if (action.payload.dismissAfterProcessing) {
            this.store.dispatch(
              AttemptUpdateRecommendedAction({
                recommendedAction: {
                  id: action.payload.id,
                  timeFrameEnd: new Date()
                }
              })
            );
          }
        })
        .catch(this.utility.errorHandler.bind(this));
    })
  ), { dispatch: false });
}
