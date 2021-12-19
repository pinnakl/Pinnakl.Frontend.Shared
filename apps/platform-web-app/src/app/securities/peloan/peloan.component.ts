import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { PeLoan } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'peloan',
  templateUrl: './peloan.component.html',
  styleUrls: ['./peloan.component.scss']
})
export class PeloanComponent extends AssetComponent {
  peLoan: PeLoan;
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
