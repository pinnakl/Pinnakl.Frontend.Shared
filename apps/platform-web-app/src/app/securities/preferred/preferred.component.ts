import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Preferred } from '@pnkl-frontend/shared';
import { SecurityAttributeOption } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'preferred.component.html'
})
export class PreferredComponent extends AssetComponent {
  preferred: Preferred;
  dividendFrequencyOptions: SecurityAttributeOption[];
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
