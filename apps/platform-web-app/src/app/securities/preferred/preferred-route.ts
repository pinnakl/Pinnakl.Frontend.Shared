import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';

import { PreferredService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { PreferredResolvedData } from './preferred-resolved-data.model';
import { PreferredComponent } from './preferred.component';

@Injectable()
export class PreferredResolve implements Resolve<PreferredResolvedData> {
  constructor(
    private readonly preferredService: PreferredService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService
  ) {}

  async resolve(): Promise<PreferredResolvedData> {
    const PAYMENT_FREQUENCY =
        '/security_master/payload/instrument/debt/coupon_payment_feature/payment_frequency',
      security = this.securitiesHelper.securityDetailsResolvedData.security;
    return Promise.all([
      this.securityService.getSecurityAttributeOptions(PAYMENT_FREQUENCY, true),
      security
        ? this.preferredService.getPreferredFromSecurityId(security.id)
        : null
    ]).then(result => {
      const [paymentFrequencyOptions, preferred] = result;
      return new PreferredResolvedData(paymentFrequencyOptions, preferred);
    });
  }
}

export const preferredRoute: Route = {
  path: 'pfd',
  component: PreferredComponent,
  resolve: {
    resolvedData: PreferredResolve
  }
};
