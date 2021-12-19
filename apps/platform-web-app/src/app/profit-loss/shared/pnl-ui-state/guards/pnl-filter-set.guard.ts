import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

import { AccountsBackendStateFacade, Utility } from '@pnkl-frontend/shared';
import { Account } from '@pnkl-frontend/shared';
import { PnlUiStateFacadeService } from '../pnl-ui-state-facade.service';
import { SetPnlFilter } from '../store';

// Can only be used alongside AllAccountsLoadedGuard
@Injectable()
export class PnlFilterSetGuard implements CanActivate {
  constructor(
    private readonly _accountsBackendStateFacade: AccountsBackendStateFacade,
    private readonly _pnlUiStateFacadeService: PnlUiStateFacadeService,
    private readonly _store: Store<any>,
    private readonly _utils: Utility
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._pnlFilterSet(state);
  }

  private _pnlFilterSet(state: RouterStateSnapshot): Observable<boolean> {
    return this._pnlUiStateFacadeService.pnlFilterValue$.pipe(
      tap(filterValue => {
        const isRealtime = state.url.includes('realtime');

        if (filterValue) {
          const lastBusinessDay = this._utils.getPreviousBusinessDay();
          this._store.dispatch(
            SetPnlFilter({
              payload: {
                account: filterValue.account,
                endDate: isRealtime ? new Date() : lastBusinessDay,
                startDate: isRealtime ? new Date() : lastBusinessDay
              }
            })
          );
          return;
        }

        this._setPnlFilter(isRealtime);
      }),
      filter(filterValue => !!filterValue),
      map(() => true),
      take(1)
    );
  }

  private async _getAccounts(): Promise<Account[]> {
    return this._accountsBackendStateFacade.accounts$.pipe(take(1)).toPromise();
  }

  private _setPnlFilter(isRealtime: boolean): void {
    this._accountsBackendStateFacade.accountsLoaded$
      .pipe(
        filter(loaded => loaded),
        take(1)
      )
      .subscribe(async () => {
        const accounts = await this._getAccounts();
        const mostImportantAccount = accounts.find(
          a => a.orderOfImportance === '1'
        );
        const lastBusinessDay = this._utils.getPreviousBusinessDay();
        this._store.dispatch(
          SetPnlFilter({
            payload: {
              account: mostImportantAccount,
              endDate: isRealtime ? new Date() : lastBusinessDay,
              startDate: isRealtime ? new Date() : lastBusinessDay
            }
          })
        );
      });
  }
}
