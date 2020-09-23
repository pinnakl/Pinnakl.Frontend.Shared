import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';

import { AccountingService } from '@pnkl-frontend/shared';
import { AccountService } from '../../../../../pinnakl-web-services/account.service';
import { LoadAccountsAum } from '../../../../aum/aum-backend-state/store/aum.actions';
import {
  AccountActionTypes,
  AttemptLoadAccounts,
  LoadAccounts,
  LoadAccountsFailed
} from './account.actions';

@Injectable()
export class AccountEffects {
  @Effect()
  load$: Observable<LoadAccounts | LoadAccountsFailed> = this.actions$.pipe(
    ofType<AttemptLoadAccounts>(AccountActionTypes.AttemptLoadAccounts),
    mergeMap(() =>
      this._accountService
        .getAccounts()
        .then(accounts => new LoadAccounts({accounts}))
        .catch(error => new LoadAccountsFailed({error}))
    )
  );

  @Effect()
  loadAccountsAum$: Observable<any> = this.actions$.pipe(
    ofType<LoadAccounts>(AccountActionTypes.LoadAccounts),
    map(action => action?.payload?.accounts),
    concatMap(async accounts => new LoadAccountsAum(
      (await Promise.all(
        accounts.map(a => this._accountingService.getAUMByAccountIdAndDate(a.id.toString(), new Date()))
      )).map(r => ({ accountId: r[0].accountid, aum: +r[0].aum }))
    )),
    catchError(err => {
      console.log('Error during fetching accounts aum', err);
      return of([]);
    })
  );

  constructor(
    private readonly _accountService: AccountService,
    private readonly _accountingService: AccountingService,
    private actions$: Actions
  ) {}
}
