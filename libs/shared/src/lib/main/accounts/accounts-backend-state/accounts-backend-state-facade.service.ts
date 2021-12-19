import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { Account } from '../../../models';
import { selectAccountsLoaded, selectAllAccounts, State } from './store';

@Injectable()
export class AccountsBackendStateFacade {
  constructor(private readonly _store: Store<State>) {}
  accounts$: Observable<Account[]> = this._store.select(selectAllAccounts);
  accountsLoaded$: Observable<boolean> = this._store.select(
    selectAccountsLoaded
  );
  get mostImportantAccount(): Account {
    let allAccounts: Account[];
    this.accounts$.pipe(first()).subscribe(x => (allAccounts = x));
    const mostImportantAccount = allAccounts.find(
      a => a.orderOfImportance === '1'
    );
    return mostImportantAccount;
  }
}
