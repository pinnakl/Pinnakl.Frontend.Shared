import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';

import { AccountingService } from '../../../../pinnakl-web-services/accounting.service';
import {
  AttemptLoadAum,
  LoadAum,
  LoadAumFailed
} from './aum.actions';

@Injectable()
export class AumEffects {
  constructor(
    private readonly _accountingService: AccountingService,
    private readonly _actions$: Actions
  ) { }

  load$ = createEffect(() => this._actions$.pipe(
    ofType(AttemptLoadAum),
    map(action => action),
    concatMap(async ({ accountId, date }) => {
      try {
        const aums = await this._accountingService.getAUMByAccountIdAndDate(
          accountId.toString(),
          date
        );
        const aum = +aums[0].aum;
        return LoadAum({ aum });
      } catch (error) {
        return LoadAumFailed({ error });
      }
    })
  ));
}
