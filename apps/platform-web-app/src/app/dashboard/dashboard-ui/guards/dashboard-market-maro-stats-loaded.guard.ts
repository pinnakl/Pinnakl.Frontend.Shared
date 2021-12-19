import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { selectDashboardMarketMacroStatsLoaded } from '../../dashboard-backend-state/store';
import { AttemptLoadDashboardMarketMacroStats } from '../../dashboard-backend-state/store/dashboard-market-macro-stat/dashboard-market-macro-stat.actions';

@Injectable()
export class DashboardMarketMaroStatsLoadedGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.store.pipe(
      select(selectDashboardMarketMacroStatsLoaded),
      tap(loaded => {
        if (!loaded) {
          this.store.dispatch(AttemptLoadDashboardMarketMacroStats());
        }
      }),
      filter(loaded => loaded),
      first()
    );
  }

  constructor(private readonly store: Store<any>) {}
}
