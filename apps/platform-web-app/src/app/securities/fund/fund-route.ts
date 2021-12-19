import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';

import { FundService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { FundResolvedData } from './fund-resolved-data.model';
import { FundComponent } from './fund.component';

@Injectable()
export class FundResolve implements Resolve<FundResolvedData> {
  constructor(
    private readonly fundService: FundService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService
  ) {}

  async resolve(): Promise<FundResolvedData> {
    const PAYMENT_FREQUENCY =
        '/security_master/payload/instrument/debt/coupon_payment_feature/payment_frequency',
      security = this.securitiesHelper.securityDetailsResolvedData.security;
    const result = await Promise.all([
      security ? this.fundService.getFundFromSecurityId(security.id) : null,
      this.securityService.getSecurityAttributeOptions(PAYMENT_FREQUENCY, true)
    ]);
    const [fund, paymentFrequencyOptions] = result;
    return new FundResolvedData(paymentFrequencyOptions, fund);
  }
}

export const fundRoute: Route = {
  path: 'fund',
  component: FundComponent,
  resolve: {
    resolvedData: FundResolve
  }
};
