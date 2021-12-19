import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';

import { PositionService } from '@pnkl-frontend/shared';
import {
  AttemptLoadSecurityPriceAlerts,
  LoadSecurityPriceAlerts,
  LoadSecurityPriceAlertsFailed
} from './security-prices-alerts.actions';

@Injectable()
export class SecurityPriceAlertEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadSecurityPriceAlerts),
    concatMap(async () => {
      try {
        const securityPriceAlerts = await this.positionService.getPriceAlerts();
        return LoadSecurityPriceAlerts({ securityPriceAlerts });
      } catch (error) {
        return LoadSecurityPriceAlertsFailed({ error });
      }
    })
  ));

  constructor(
    private readonly actions$: Actions,
    private readonly positionService: PositionService
  ) {}
}
