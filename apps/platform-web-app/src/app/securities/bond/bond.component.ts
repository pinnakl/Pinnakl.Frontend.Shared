import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Bond } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'bond.component.html'
})
export class BondComponent extends AssetComponent {
  bond: Bond;
  couponTypes: SecurityAttributeOption[];
  interestBasisOptions: SecurityAttributeOption[];
  paymentFrequencyOptions: SecurityAttributeOption[];
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
