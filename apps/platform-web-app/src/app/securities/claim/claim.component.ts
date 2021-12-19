import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'claim.component.html'
})
export class ClaimComponent extends AssetComponent {
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
