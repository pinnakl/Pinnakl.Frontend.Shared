import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Cds } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'cds',
  templateUrl: './cds.component.html'
})
export class CdsComponent extends AssetComponent {
  cds: Cds;
  paymentFrequencyOptions: SecurityAttributeOption[];
  businessDaysOptions: string[];
  businessDayConvention: string[];
  fixedRateDayCount: string[];
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
