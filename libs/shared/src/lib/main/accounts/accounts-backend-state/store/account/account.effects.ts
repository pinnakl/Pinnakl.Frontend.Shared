import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';

import { LoadAccountsAum } from '../../../../aum';
import {
  AttemptLoadAccounts,
  LoadAccounts,
  LoadAccountsFailed
} from './account.actions';
import { AccountService } from '../../../../../pinnakl-web-services/account.service';
import { AccountingService } from '../../../../../pinnakl-web-services/accounting.service';

@Injectable()
export class AccountEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(AttemptLoadAccounts),
    mergeMap(() =>
      this._accountService
        .getAccounts()
        .then(accounts => LoadAccounts({ accounts }))
        .catch(error => LoadAccountsFailed({ error }))
    )
  ));

  loadAccountsAum$: Observable<any> = createEffect(() => this.actions$.pipe(
    ofType(LoadAccounts),
    map(action => action?.accounts),
    concatMap(async accounts => LoadAccountsAum({
      payload: (await Promise.all(
        accounts.map(a => this._accountingService.getAUMByAccountIdAndDate(a.id.toString(), new Date()))
      )).map(r => ({ accountId: r[0].accountid, aum: +r[0].aum }))
    })),
    catchError(() => of(LoadAccountsAum({ payload: [{ accountId: 0, aum: 0 }] })))
  ));

  constructor(
    private readonly _accountService: AccountService,
    private readonly _accountingService: AccountingService,
    private readonly actions$: Actions
  ) { }
}
