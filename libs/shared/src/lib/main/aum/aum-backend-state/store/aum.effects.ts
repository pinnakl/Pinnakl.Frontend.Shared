import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { AccountingService } from '../../../../pinnakl-web-services/accounting.service';
import {
  AttemptLoadAum,
  AumActionTypes,
  LoadAum,
  LoadAumFailed
} from './aum.actions';

@Injectable()
export class AumEffects {
  constructor(
    private _accountingService: AccountingService,
    private _actions$: Actions
  ) {}

  @Effect()
  load$: Observable<LoadAum | LoadAumFailed> = this._actions$.pipe(
    ofType<AttemptLoadAum>(AumActionTypes.AttemptLoadAum),
    map(action => action.payload),
    concatMap(async ({ accountId, date }) => {
      try {
        const aums = await this._accountingService.getAUMByAccountIdAndDate(
          accountId.toString(),
          date
        );
        const aum = +aums[0].aum;
        return new LoadAum({ aum });
      } catch (error) {
        return new LoadAumFailed({ error });
      }
    })
  );
}
