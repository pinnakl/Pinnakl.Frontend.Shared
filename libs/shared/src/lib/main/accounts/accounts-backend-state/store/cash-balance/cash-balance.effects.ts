import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap } from 'rxjs/operators';
import { AccountingService } from '../../../../../pinnakl-web-services';
import { Utility } from '../../../../../services';

import {
  AttemptLoadCashBalance,
  LoadCashBalance,
  LoadCashBalanceFailed
} from './cash-balance.actions';

@Injectable()
export class CashBalanceEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadCashBalance),
    mergeMap(() => this._accountingService
      .getCashBal(this.getDate())
      .then(cashBalance => LoadCashBalance({ cashBalance }))
      .catch(error => LoadCashBalanceFailed({ error }))
    )
  ));

  constructor(
    private readonly _accountingService: AccountingService,
    private readonly _utils: Utility,
    private readonly actions$: Actions
  ) { }

  private getDate(): Date {
    const prevDate = this._utils.getPreviousBusinessDay();
    if (prevDate.getDay() !== new Date().getDay()) {
      return this._utils.getPreviousBusinessDay(prevDate);
    }
    return prevDate;
  }
}
