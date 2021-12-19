import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, tap } from 'rxjs/operators';

import { OMSService, Utility } from '@pnkl-frontend/shared';
import {
  AttemptLoadSelectedCurrency,
  LoadSelectedCurrency,
  LoadSelectedCurrencyFailed
} from './selected-currency.actions';

@Injectable()
export class SelectedCurrencyEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadSelectedCurrency),
    map(payload => payload),
    concatMap(async ({ currency, date }) => {
      try {
        const { currencyId, fxRate } = await this.omsService.getFxRate(
          date,
          currency
        );
        return LoadSelectedCurrency({ payload: { currencyId, fxRate } });
      } catch (error) {
        return LoadSelectedCurrencyFailed({ error });
      }
    })
  ));

  currencySelectionFailed$ = createEffect(() => this.actions$.pipe(
    ofType(LoadSelectedCurrencyFailed),
    tap(action => this.utility.showError(action.error))
  ), { dispatch: false });

  constructor(
    private readonly actions$: Actions,
    private readonly omsService: OMSService,
    private readonly utility: Utility
  ) { }
}
