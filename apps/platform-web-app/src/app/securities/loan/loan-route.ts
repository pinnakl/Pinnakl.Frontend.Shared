import { Injectable } from '@angular/core';
import { Resolve, Route } from '@angular/router';

import { LoanService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { LoanResolvedData } from './loan-resolved-data.model';
import { LoanComponent } from './loan.component';

@Injectable()
export class LoanResolve implements Resolve<LoanResolvedData> {
  constructor(
    private readonly loanService: LoanService,
    private readonly securitiesHelper: SecuritiesHelper,
    private readonly securityService: SecurityService
  ) { }

  async resolve(): Promise<LoanResolvedData> {
    const COUPON_TYPES =
        '/security_master/payload/instrument/debt/fixed_income/coupon_type',
      INTEREST_BASIS =
        '/security_master/payload/instrument/debt/coupon_payment_feature/interest_basis',
      PAYMENT_FREQUENCY =
        '/security_master/payload/instrument/debt/coupon_payment_feature/payment_frequency',
      security = this.securitiesHelper.securityDetailsResolvedData.security;
    const result = await Promise.all([
      this.securityService.getSecurityAttributeOptions(COUPON_TYPES, true),
      this.securityService.getSecurityAttributeOptions(INTEREST_BASIS, true),
      security ? this.loanService.getLoanFromSecurityId(security.id) : null,
      this.securityService.getSecurityAttributeOptions(PAYMENT_FREQUENCY, true)
    ]);
    const [
      couponTypes, interestBasisOptions, loan, paymentFrequencyOptions
    ] = result;
    return new LoanResolvedData(
      couponTypes,
      interestBasisOptions,
      loan,
      paymentFrequencyOptions
    );
  }
}

export const loanRoute: Route = {
  path: 'bankdebt',
  component: LoanComponent,
  resolve: {
    resolvedData: LoanResolve
  }
};
