import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Account, AccountsBackendStateFacade, ChartTypes, Utility } from '@pnkl-frontend/shared';
import * as moment from 'moment';
import { filter, first, map } from 'rxjs/operators';
import { DataTypes } from '../../pnl-backend/pnl-calculated-timeseries/pnl-calculated-timeseries-filter.model';
import { PnlUiStateFacadeService } from '../pnl-ui-state-facade.service';

@Injectable()
export class PnlCalculatedTimeseriesLoadedGuard implements CanActivate {
  async canActivate(): Promise<boolean> {
    return this.getLoaded();
  }

  private async getAccounts(): Promise<Account[]> {
    return new Promise<Account[]>(resolve => {
      this._accountsBackendStateFacade.accountsLoaded$
        .pipe(
          filter(loaded => loaded),
          first(),
          map(() => {
            let accounts: Account[];
            this._accountsBackendStateFacade.accounts$
              .pipe(first())
              .subscribe(x => (accounts = x));
            return accounts;
          })
        )
        .subscribe(resolve);
    });
  }

  private async getLoaded(): Promise<boolean> {
    const accounts = await this.getAccounts();
    const mostImportantAccount = accounts.find(
      a => a.orderOfImportance === '1'
    );
    const previousBusinessDay = this._utils.getPreviousBusinessDay();
    await this._pnlUiStateFacadeService.setPnlCalculatedTimeseriesFilter(
      {
        accountId: +mostImportantAccount.id,
        endDate: previousBusinessDay,
        groupingKey: { name: 'Analyst', type: 'trade' },
        chartType: ChartTypes.BAR,
        dataType: DataTypes.TOTAL,
        startDate: moment(previousBusinessDay)
          .subtract(30, 'd')
          .toDate()
      },
      false
    );
    return true;
  }

  constructor(
    private readonly _accountsBackendStateFacade: AccountsBackendStateFacade,
    private readonly _pnlUiStateFacadeService: PnlUiStateFacadeService,
    private readonly _utils: Utility
  ) {}
}
