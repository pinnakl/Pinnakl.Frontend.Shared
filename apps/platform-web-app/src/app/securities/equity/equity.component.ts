import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Equity } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'equity.component.html'
})
export class EquityComponent extends AssetComponent {
  equity: Equity;
  dividendFrequencyOptions: SecurityAttributeOption[];
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
