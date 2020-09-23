import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import {
  DashboardBackendActionTypes,
  LoadActivitySummary,
  LoadActivitySummaryFailed,
  LoadDashboardBackendFailed
} from '../../dashboard-backend-state/store/dashboard';
import { Utility } from '@pnkl-frontend/shared';
import { concatMap, map, take } from 'rxjs/operators';
@Injectable()
export class DashboardUiEffects {
  constructor(
    private actions$: Actions,
    private spinner: PinnaklSpinner,
    private utility: Utility
  ) {}

  @Effect({ dispatch: false })
  applyDashboardSpiner$ = this.actions$.pipe(
    ofType(DashboardBackendActionTypes.AttemptLoadDashboardBackend),
    concatMap(() => {
      this.spinner.spin();
      return this.actions$.pipe(
        ofType(DashboardBackendActionTypes.LoadDashboardBackendFailed),
        take(1),
        map((action: LoadDashboardBackendFailed) => {
          this.utility.showError(action.payload.error);
        })
      );
    })
  );

  @Effect({ dispatch: false })
  applyActivitySummarySpiner$ = this.actions$.pipe(
    ofType(DashboardBackendActionTypes.AttemptLoadActivitySummary),
    concatMap(() => {
      this.spinner.spin();
      return this.actions$.pipe(
        ofType(
          DashboardBackendActionTypes.LoadActivitySummary,
          DashboardBackendActionTypes.LoadActivitySummaryFailed
        ),
        take(1),
        map((action: LoadActivitySummary | LoadActivitySummaryFailed) => {
          if (action.type === DashboardBackendActionTypes.LoadActivitySummary) {
            this.spinner.stop();
          } else {
            this.utility.showError(action.payload.error);
          }
        })
      );
    })
  );
}
