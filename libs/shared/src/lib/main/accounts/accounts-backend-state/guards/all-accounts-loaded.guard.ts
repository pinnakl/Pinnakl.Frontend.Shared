import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { select } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { selectAccountsLoaded, State } from '../store';
import { AttemptLoadAccounts } from '../store/account';
import { AttemptLoadCashBalance } from '../store/cash-balance';

@Injectable()
export class AllAccountsLoadedGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.accountsLoaded();
  }

  private accountsLoaded(): Observable<boolean> {
    return this.store.pipe(
      select(selectAccountsLoaded),
      tap(loaded => {
        if (loaded) {
          return;
        }
        this.store.dispatch(AttemptLoadAccounts());
        this.store.dispatch(AttemptLoadCashBalance());
      }),
      filter(loaded => loaded),
      take(1)
    );
  }

  constructor(private readonly store: Store<State>) {}
}
