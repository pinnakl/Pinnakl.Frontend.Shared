import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatMap } from 'rxjs/operators';

import { PinnaklSpinner, Toastr } from '@pnkl-frontend/core';
import { RecommendedActionsProcessingService } from '../../dashboard-backend';
import { AttemptUpdateRecommendedAction } from '../../dashboard-backend-state/store/recommended-actions';
import { Utility } from '@pnkl-frontend/shared';
import {
  ProcessRecommendedAction,
  RecommendedActionProcessingActionTypes
} from './recommended-actions-processing.actions';

@Injectable()
export class RecommendedActionProcessingEffects {
  constructor(
    private actions$: Actions,
    private pnklSpinner: PinnaklSpinner,
    private recommendedActionProcessingSvc: RecommendedActionsProcessingService,
    private store: Store<any>,
    private toastr: Toastr,
    private utility: Utility
  ) {}

  @Effect({ dispatch: false })
  processAction$ = this.actions$.pipe(
    ofType(RecommendedActionProcessingActionTypes.ProcessRecommendedAction),
    concatMap((action: ProcessRecommendedAction) => {
      this.pnklSpinner.spin();
      return this.recommendedActionProcessingSvc
        .process(action.payload)
        .then(processed => {
          this.pnklSpinner.stop();
          this.toastr.success('Action Processed');
          if (action.payload.dismissAfterProcessing) {
            this.store.dispatch(
              new AttemptUpdateRecommendedAction({
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
  );
}
