import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { AccountingService, Utility } from '@pnkl-frontend/shared';

import {
  AttemptLoadCashBalance,
  CashBalanceActionTypes,
  LoadCashBalance,
  LoadCashBalanceFailed
} from './cash-balance.actions';

@Injectable()
export class CashBalanceEffects {
  @Effect()
  load$: Observable<LoadCashBalance | LoadCashBalanceFailed> = this.actions$.pipe(
    ofType<AttemptLoadCashBalance>(CashBalanceActionTypes.AttemptLoadCashBalance),
    mergeMap(() => this._accountingService
      .getCashBal(this.getDate())
      .then(cashBalance => new LoadCashBalance({cashBalance}))
      .catch(error => new LoadCashBalanceFailed({error}))
    )
  );

  constructor(
    private readonly _accountingService: AccountingService,
    private readonly _utils: Utility,
    private actions$: Actions
  ) {}

  private getDate(): Date {
    const prevDate = this._utils.getPreviousBusinessDay();
    if (prevDate.getDay() !== new Date().getDay()) {
      return this._utils.getPreviousBusinessDay(prevDate);
    }
    return prevDate;
  }
}
