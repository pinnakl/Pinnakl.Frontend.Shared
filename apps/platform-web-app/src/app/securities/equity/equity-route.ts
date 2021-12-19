import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';

import { EquityService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { EquityResolvedData } from './equity-resolved-data.model';
import { EquityComponent } from './equity.component';

@Injectable()
export class EquityResolve implements Resolve<EquityResolvedData> {
  constructor(
    private readonly equityService: EquityService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService
  ) {}

  async resolve(): Promise<EquityResolvedData> {
    const PAYMENT_FREQUENCY =
        '/security_master/payload/instrument/debt/coupon_payment_feature/payment_frequency',
      security = this.securitiesHelper.securityDetailsResolvedData.security;
    const result = await Promise.all([
      security ? this.equityService.getEquityFromSecurityId(security.id) : null,
      this.securityService.getSecurityAttributeOptions(PAYMENT_FREQUENCY, true)
    ]);
    const [equity, paymentFrequencyOptions] = result;
    return new EquityResolvedData(paymentFrequencyOptions, equity);
  }
}

export const equityRoute: Route = {
  path: 'equity',
  component: EquityComponent,
  resolve: {
    resolvedData: EquityResolve
  }
};
