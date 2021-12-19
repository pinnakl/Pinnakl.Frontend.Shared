import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Utility } from '@pnkl-frontend/shared';
import { concatMap, map, take } from 'rxjs/operators';
import {
  AttemptLoadDashboardBackend,
  DashboardBackendActionTypes,
  LoadActivitySummary,
  LoadActivitySummaryFailed,
  LoadDashboardBackendFailed
} from '../../dashboard-backend-state/store/dashboard/dashboard-backend.actions';

@Injectable()
export class DashboardUiEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly spinner: PinnaklSpinner,
    private readonly utility: Utility
  ) { }

  applyDashboardSpiner$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadDashboardBackend),
    concatMap(() => {
      this.spinner.spin();
      return this.actions$.pipe(
        ofType(LoadDashboardBackendFailed),
        take(1),
        map(action => this.utility.showError(action.error))
      );
    })
  ), { dispatch: false });

  applyActivitySummarySpiner$ = createEffect(() => this.actions$.pipe(
    ofType(DashboardBackendActionTypes.AttemptLoadActivitySummary),
    concatMap(() => {
      this.spinner.spin();
      return this.actions$.pipe(
        ofType(LoadActivitySummary, LoadActivitySummaryFailed),
        take(1),
        map(action => {
          if (action.type === DashboardBackendActionTypes.LoadActivitySummary) {
            this.spinner.stop();
          } else {
            this.utility.showError(action.error);
          }
        })
      );
    })
  ), { dispatch: false });
}
