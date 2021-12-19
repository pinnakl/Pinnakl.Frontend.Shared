import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Loan } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'loan.component.html'
})
export class LoanComponent extends AssetComponent {
  couponTypes: SecurityAttributeOption[];
  interestBasisOptions: SecurityAttributeOption[];
  loan: Loan;
  paymentFrequencyOptions: SecurityAttributeOption[];
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
