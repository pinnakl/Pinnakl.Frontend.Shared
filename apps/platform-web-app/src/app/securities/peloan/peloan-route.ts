import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { PeLoanResolvedData } from './peloan-resolved-data.model';
import { PeloanComponent } from './peloan.component';
import { PeloanService } from './peloan.service';

@Injectable()
export class PeLoanResolve implements Resolve<PeLoanResolvedData> {
  constructor(
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService,
    private readonly peloanService: PeloanService
  ) { }

  async resolve(): Promise<PeLoanResolvedData> {
    const COUPON_TYPES =
        '/security_master/payload/instrument/debt/fixed_income/coupon_type',
      INTEREST_BASIS =
        '/security_master/payload/instrument/debt/coupon_payment_feature/interest_basis',
      PAYMENT_FREQUENCY =
        '/security_master/payload/instrument/debt/coupon_payment_feature/payment_frequency',
      security = this.securitiesHelper.securityDetailsResolvedData.security;
    return Promise.all([
      security ? this.peloanService.getPeLoanFromSecurityId(security.id) : null,
      this.securityService.getSecurityAttributeOptions(COUPON_TYPES, true),
      this.securityService.getSecurityAttributeOptions(INTEREST_BASIS, true),
      this.securityService.getSecurityAttributeOptions(PAYMENT_FREQUENCY, true)
    ]).then(result => {
      const [
        peLoan,
        couponTypes,
        interestBasisOptions,
        paymentFrequencyOptions
      ] = result;

      const entity: PeLoanResolvedData = {
        peLoan: peLoan,
        couponTypes: couponTypes,
        interestBasisOptions: interestBasisOptions,
        paymentFrequencyOptions: paymentFrequencyOptions
      };

      return entity;
    });
  }
}

export const peloanRoute: Route = {
  path: 'peloan',
  component: PeloanComponent,
  resolve: {
    resolvedData: PeLoanResolve
  }
};
