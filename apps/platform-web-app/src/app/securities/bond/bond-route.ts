import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';

import { BondService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { BondResolvedData } from './bond-resolved-data.model';
import { BondComponent } from './bond.component';

@Injectable()
export class BondResolve implements Resolve<BondResolvedData> {
  constructor(
    private readonly bondService: BondService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService
  ) {}
  resolve(): Promise<BondResolvedData> {
    const COUPON_TYPES =
        '/security_master/payload/instrument/debt/fixed_income/coupon_type',
      INTEREST_BASIS =
        '/security_master/payload/instrument/debt/coupon_payment_feature/interest_basis',
      PAYMENT_FREQUENCY =
        '/security_master/payload/instrument/debt/coupon_payment_feature/payment_frequency',
      security = this.securitiesHelper.securityDetailsResolvedData.security;
    return Promise.all([
      security ? this.bondService.getBondFromSecurityId(security.id) : null,
      this.securityService.getSecurityAttributeOptions(COUPON_TYPES, true),
      this.securityService.getSecurityAttributeOptions(INTEREST_BASIS, true),
      this.securityService.getSecurityAttributeOptions(PAYMENT_FREQUENCY, true)
    ]).then(result => {
      const [
        bond,
        couponTypes,
        interestBasisOptions,
        paymentFrequencyOptions
      ] = result;
      return new BondResolvedData(
        bond,
        couponTypes,
        interestBasisOptions,
        paymentFrequencyOptions
      );
    });
  }
}

export const bondRoute: Route = {
  path: 'bond',
  component: BondComponent,
  resolve: {
    resolvedData: BondResolve
  }
};
