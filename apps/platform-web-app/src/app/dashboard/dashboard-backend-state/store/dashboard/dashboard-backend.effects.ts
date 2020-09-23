import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { DashboardService } from '../../../dashboard-backend/dashboard/dashboard.service';
import * as fromDashboardActions from './dashboard-backend.actions';

import { from as fromPromise, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class DashboardBackendEffects {
  constructor(
    private actions$: Actions,
    private dashboardService: DashboardService
  ) {}

  @Effect() // an effect always dispatch an action
  loadDashboard$ = this.actions$.pipe(
    ofType(
      fromDashboardActions.DashboardBackendActionTypes
        .AttemptLoadDashboardBackend
    ),
    // switchmap because we want return a brand new observable using
    // which we can do things like mapover and return new action
    switchMap(() => {
      return this.dashboardService
        .getDashboardData()
        .then(
          dashboardData =>
            new fromDashboardActions.LoadDashboardBackend({
              dashboardBackend: dashboardData
            })
        )
        .catch(
          error => new fromDashboardActions.LoadDashboardBackendFailed(error)
        );
    })
  );

  @Effect() // an effect always dispatch an action
  loadActivitySummary$ = this.actions$.pipe(
    ofType(
      fromDashboardActions.DashboardBackendActionTypes
        .AttemptLoadActivitySummary
    ),
    // switchmap because we want return a brand new observable using
    // which we can do things like mapover and return new action
    switchMap((action: fromDashboardActions.AttemptLoadActivitySummary) => {
      const startDate = action.payload.startDate;
      const endDate = action.payload.endDate;
      return fromPromise(
        this.dashboardService.getActivitySummaryData(startDate, endDate)
      ).pipe(
        map(
          activitySummaryData =>
            new fromDashboardActions.LoadActivitySummary({
              activitySummary: activitySummaryData
            }),
          catchError(error =>
            of(new fromDashboardActions.LoadDashboardBackendFailed(error))
          )
        )
      );
    })
  );
}
