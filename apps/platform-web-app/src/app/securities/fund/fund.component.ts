import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Fund } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'fund.component.html'
})
export class FundComponent extends AssetComponent {
  fund: Fund;
  dividendFrequencyOptions: SecurityAttributeOption[];
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
