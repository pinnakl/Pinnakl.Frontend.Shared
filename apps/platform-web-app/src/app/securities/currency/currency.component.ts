import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Currency } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'currency.component.html'
})
export class CurrencyComponent extends AssetComponent {
  currency: Currency;
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
