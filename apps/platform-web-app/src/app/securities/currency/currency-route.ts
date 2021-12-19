import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';

import { CurrencyService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { CurrencyResolvedData } from './currency-resolved-data.model';
import { CurrencyComponent } from './currency.component';

@Injectable()
export class CurrencyResolve implements Resolve<CurrencyResolvedData> {
  constructor(
    private readonly currencyService: CurrencyService,
    private readonly securitiesHelper: SecuritiesHelper
  ) {}

  async resolve(): Promise<CurrencyResolvedData> {
    const security = this.securitiesHelper.securityDetailsResolvedData.security;
    return Promise.all([
      security
        ? this.currencyService.getCurrencyFromSecurityId(security.id)
        : null
    ]).then(result => {
      const [currency] = result;
      return new CurrencyResolvedData(currency);
    });
  }
}

export const currencyRoute: Route = {
  path: 'crncy',
  component: CurrencyComponent,
  resolve: {
    resolvedData: CurrencyResolve
  }
};
