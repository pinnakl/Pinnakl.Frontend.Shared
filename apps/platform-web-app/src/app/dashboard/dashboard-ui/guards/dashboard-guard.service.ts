import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { select } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { selectDashboardLoadedAttribute, State } from '../../dashboard-backend-state/store';
import { AttemptLoadDashboardBackend } from '../../dashboard-backend-state/store/dashboard/dashboard-backend.actions';

@Injectable()
export class DashboardGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.dashboardDataLoaded();
  }

  constructor(
    private readonly store: Store<State>,
    private readonly spinner: PinnaklSpinner
  ) {}

  private dashboardDataLoaded(): Observable<boolean> {
    return this.store.pipe(
      select(selectDashboardLoadedAttribute),
      tap(loaded => {
        if (loaded) {
          this.spinner.stop();
          return;
        }
        this.store.dispatch(AttemptLoadDashboardBackend());
      }),
      filter(loaded => loaded),
      take(1)
    );
  }
}
