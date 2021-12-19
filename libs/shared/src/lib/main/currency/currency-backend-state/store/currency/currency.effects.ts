import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap } from 'rxjs/operators';

import {
  AttemptLoadCurrencies,
  LoadCurrencies,
  LoadCurrenciesFailed
} from './currency.actions';
import { OMSService } from '../../../../../pinnakl-web-services/oms.service';

@Injectable()
export class CurrencyEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadCurrencies),
    mergeMap(() =>
      this.omsService
        .getCurrencies()
        .then(currencies => LoadCurrencies({ currencies }))
        .catch(error => LoadCurrenciesFailed({ error }))
    )
  ));

  constructor(private readonly actions$: Actions, private readonly omsService: OMSService) { }
}
