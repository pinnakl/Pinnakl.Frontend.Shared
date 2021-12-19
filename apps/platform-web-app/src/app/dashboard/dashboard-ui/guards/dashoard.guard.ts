import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { select } from '@ngrx/store';
import { Store } from '@ngrx/store';
import {
  selectDashboardLoadedAttribute,
  State
} from '../../dashboard-backend-state';
import { AttemptLoadDashboardBackend } from '../../dashboard-backend-state/store/dashboard';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

@Injectable()
export class DashoardGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.dashboardDataLoaded();
  }

  constructor(private store: Store<State>) {}

  private dashboardDataLoaded(): Observable<boolean> {
    return this.store.pipe(
      select(selectDashboardLoadedAttribute),
      tap(loaded => {
        if (loaded) {
          return;
        }
        // this.store.dispatch(new AttemptLoadDashboardBackend());
      }),
      filter(loaded => loaded),
      take(1)
    );
  }
}
