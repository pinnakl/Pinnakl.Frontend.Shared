import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Future } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';

@Component({
  templateUrl: 'future.component.html'
})
export class FutureComponent extends AssetComponent {
  future: Future;
  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(activatedRoute, securitiesHelper);
  }
}
