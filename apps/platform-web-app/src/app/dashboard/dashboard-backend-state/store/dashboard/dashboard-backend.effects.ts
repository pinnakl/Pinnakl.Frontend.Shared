import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromDashboardActions from './dashboard-backend.actions';

import { from as fromPromise, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DashboardService } from '../../../dashboard-backend/dashboard/dashboard.service';

@Injectable()
export class DashboardBackendEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly dashboardService: DashboardService
  ) { }

  loadDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(
      fromDashboardActions.DashboardBackendActionTypes
        .AttemptLoadDashboardBackend
    ),
    // switchmap because we want return a brand new observable using
    // which we can do things like mapover and return new action
    switchMap(() => this.dashboardService
      .getDashboardData()
      .then(dashboardData => fromDashboardActions.LoadDashboardBackend({ dashboardBackend: dashboardData }))
      .catch(error => fromDashboardActions.LoadDashboardBackendFailed(error)))
  ));

  loadActivitySummary$ = createEffect(() => this.actions$.pipe(
    ofType(fromDashboardActions.AttemptLoadActivitySummary),
    // switchmap because we want return a brand new observable using
    // which we can do things like mapover and return new action
    switchMap(action => {
      const startDate = action.startDate;
      const endDate = action.endDate;
      return fromPromise(
        this.dashboardService.getActivitySummaryData(startDate, endDate)
      ).pipe(
        map(activitySummaryData => fromDashboardActions.LoadActivitySummary({ activitySummary: activitySummaryData }),
          catchError(error => of(fromDashboardActions.LoadDashboardBackendFailed(error)))
        )
      );
    })
  ));
}
