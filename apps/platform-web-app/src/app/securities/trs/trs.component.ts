import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Security } from '@pnkl-frontend/shared';
import { AssetComponent } from '../shared/asset.component';
import { SecuritiesHelper } from '../shared/securities-helper.service';
import { TRS } from './trs-backend';

@Component({
  templateUrl: './trs.component.html'
})
export class TRSComponent extends AssetComponent {
  trs: TRS;
  trsList: TRS[];
  securities: Security[];

  constructor(
    activatedRoute: ActivatedRoute,
    securitiesHelper: SecuritiesHelper
  ) {
    super(
      activatedRoute,
      securitiesHelper
    );
  }
}
