import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, takeUntil, tap } from 'rxjs/operators';

import {
  DashboardMarketMacroStatService
} from '../../../dashboard-backend/dashboard-market-macro-stat/dashboard-market-macro-stat.service';
import {
  AttemptLoadDashboardMarketMacroStats,
  LoadDashboardMarketMacroStats,
  LoadDashboardMarketMacroStatsFailed,
  SubscribeToDashboardMarketMacroStats,
  UnsubscribeFromDashboardMarketMacroStats
} from './dashboard-market-macro-stat.actions';

@Injectable()
export class DashboardMarketMacroStatEffects {
  loadDashboardMarketMacroStats$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadDashboardMarketMacroStats),
    concatMap(async () => {
      try {
        const entities = await this.dashboardMarketMacroStatService.getAll();
        return LoadDashboardMarketMacroStats({ entities });
      } catch (error) {
        return LoadDashboardMarketMacroStatsFailed({ error });
      }
    })
  ));

  subscribeDashboardMarketMacroStats$ = createEffect(() => this.actions$.pipe(
    ofType(SubscribeToDashboardMarketMacroStats),
    concatMap(() =>
      this.dashboardMarketMacroStatService.subscribe().pipe(
        map(entities => LoadDashboardMarketMacroStats({ entities })),
        takeUntil(
          this.actions$.pipe(
            ofType(UnsubscribeFromDashboardMarketMacroStats)
          )
        )
      )
    )
  ));

  unsubscribeDashboardMarketMacroStats$ = createEffect(() => this.actions$.pipe(
    ofType(UnsubscribeFromDashboardMarketMacroStats),
    tap(() => this.dashboardMarketMacroStatService.unsubscribe())
  ), {
    dispatch: false
  });

  constructor(
    private readonly actions$: Actions,
    private readonly dashboardMarketMacroStatService: DashboardMarketMacroStatService
  ) { }
}
