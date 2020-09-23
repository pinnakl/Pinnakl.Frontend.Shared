import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { OMSService } from '../../../../../pinnakl-web-services/oms.service';
import {
  AttemptLoadCurrencies,
  CurrencyActionTypes,
  LoadCurrencies,
  LoadCurrenciesFailed
} from './currency.actions';

@Injectable()
export class CurrencyEffects {
  @Effect()
  load$: Observable<LoadCurrencies | LoadCurrenciesFailed> = this.actions$.pipe(
    ofType<AttemptLoadCurrencies>(CurrencyActionTypes.AttemptLoadCurrencies),
    mergeMap(() =>
      this.omsService
        .getCurrencies()
        .then(currencies => new LoadCurrencies({ currencies }))
        .catch(error => new LoadCurrenciesFailed({ error }))
    )
  );

  constructor(private actions$: Actions, private omsService: OMSService) {}
}
