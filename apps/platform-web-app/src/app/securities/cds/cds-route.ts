import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';
import { CdsService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { CdsResolvedData } from './cds-resolved-data.model';
import { CdsComponent } from './cds.component';

@Injectable()
export class CdsResolve implements Resolve<CdsResolvedData> {
  constructor(
    private readonly cdsService: CdsService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService
  ) {}
  resolve(): Promise<CdsResolvedData> {
    const PAYMENT_FREQUENCY =
        '/security_master/payload/instrument/debt/coupon_payment_feature/payment_frequency',
      security = this.securitiesHelper.securityDetailsResolvedData.security;
    return Promise.all([
      security ? this.cdsService.getCdsFromSecurityId(security.id) : null,
      this.securityService.getSecurityAttributeOptions(PAYMENT_FREQUENCY, true)
    ]).then(result => {
      const [cds, paymentFrequencyOptions] = result;
      const businessDaysOptions = ['LDN', 'LDNTARGET', 'NY', 'NYLDN'];
      const businessDayConvention = ['FOLLOW', 'MODFOLLOW'];
      const fixedRateDayCount = ['ACT/360', '30/360'];
      return new CdsResolvedData(
        businessDayConvention,
        businessDaysOptions,
        cds,
        fixedRateDayCount,
        paymentFrequencyOptions
      );
    });
  }
}

export const cdsRoute: Route = {
  path: 'cds',
  component: CdsComponent,
  resolve: {
    resolvedData: CdsResolve
  }
};
