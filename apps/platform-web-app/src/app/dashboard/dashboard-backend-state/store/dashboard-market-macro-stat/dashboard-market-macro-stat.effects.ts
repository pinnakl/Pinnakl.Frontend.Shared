import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { concatMap, map, takeUntil } from 'rxjs/operators';

import { DashboardMarketMacroStatService } from '../../../dashboard-backend';
import {
  DashboardMarketMacroStatActionTypes,
  LoadDashboardMarketMacroStats,
  LoadDashboardMarketMacroStatsFailed
} from './dashboard-market-macro-stat.actions';

@Injectable()
export class DashboardMarketMacroStatEffects {
  @Effect()
  loadDashboardMarketMacroStats$ = this.actions$.pipe(
    ofType(
      DashboardMarketMacroStatActionTypes.AttemptLoadDashboardMarketMacroStats
    ),
    concatMap(async () => {
      try {
        const entities = await this.dashboardMarketMacroStatService.getAll();
        return new LoadDashboardMarketMacroStats({ entities });
      } catch (error) {
        return new LoadDashboardMarketMacroStatsFailed({ error });
      }
    })
  );

  @Effect()
  subscribeDashboardMarketMacroStats$ = this.actions$.pipe(
    ofType(
      DashboardMarketMacroStatActionTypes.SubscribeToDashboardMarketMacroStats
    ),
    concatMap(() =>
      this.dashboardMarketMacroStatService.subscribe().pipe(
        map(entities => new LoadDashboardMarketMacroStats({ entities })),
        takeUntil(
          this.actions$.pipe(
            ofType(
              DashboardMarketMacroStatActionTypes.UnsubscribeFromDashboardMarketMacroStats
            )
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private dashboardMarketMacroStatService: DashboardMarketMacroStatService
  ) {}
}
