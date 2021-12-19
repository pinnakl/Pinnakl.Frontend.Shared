import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { PinnaklSpinner } from '@pnkl-frontend/core';
import { Toastr } from '@pnkl-frontend/core';
import { MarketService } from '@pnkl-frontend/shared';
import { PublicIdentifierService } from '@pnkl-frontend/shared';
import { SecurityService } from '@pnkl-frontend/shared';
import { Utility } from '@pnkl-frontend/shared';
import { SecuritiesHelper } from '../../shared/securities-helper.service';
import { SecurityInformationComponent } from '../../shared/security-information.component';

@Component({
  selector: 'claim-information',
  templateUrl: 'claim-information.component.html'
})
export class ClaimInformationComponent extends SecurityInformationComponent {
  constructor(
    activatedRoute: ActivatedRoute,
    fb: FormBuilder,
    marketService: MarketService,
    pinnaklSpinner: PinnaklSpinner,
    publicIdentifierService: PublicIdentifierService,
    router: Router,
    securitiesHelper: SecuritiesHelper,
    securityService: SecurityService,
    toastr: Toastr,
    utility: Utility
  ) {
    super(
      activatedRoute,
      fb,
      marketService,
      pinnaklSpinner,
      publicIdentifierService,
      router,
      securitiesHelper,
      securityService,
      toastr,
      utility
    );
  }

  protected createAssetForm(asset: any, fb: FormBuilder): FormGroup {
    return fb.group({});
  }

  protected getUpdatedAsset(claim: any, existingEntity: any): any {
    return null;
  }

  protected postAsset(claim: any): Promise<any> {
    return Promise.resolve(claim);
  }

  protected putAsset(claim: any): Promise<any> {
    return Promise.resolve(claim);
  }

  protected resetAssetForm(claim: any, form: FormGroup): void {
    // Do Nothing
  }
}
